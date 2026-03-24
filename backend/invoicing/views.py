from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from .models import Invoice, InvoiceHistory
from .serializers import InvoiceCreateSerializer, InvoiceListSerializer, InvoiceStatusSerializer
from .services.invoice_number import generate_invoice_number
from .services.calculations import calculate_invoice_totals
from .permissions import IsInvoiceOwnerOrReadOnly
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

UserModel = get_user_model()

User = get_user_model()

class CreateInvoiceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_company_root(self, user):
        # Role Check: Only SUB_ADMIN or ACCOUNTANT
        if user.role not in ["SUB_ADMIN", "ACCOUNTANT"]:
            raise PermissionDenied("You do not have permission to create invoices.")

        if user.role == "SUB_ADMIN":
            return user
        if user.role == "ACCOUNTANT" and user.parent_user:
            return user.parent_user
        
        raise PermissionDenied("Invalid company structure.")

    @transaction.atomic
    def post(self, request):
        user = request.user
        company_root = self.get_company_root(user)

        serializer = InvoiceCreateSerializer(
            data=request.data,
            context={"request": request, "company_root": company_root}
        )
        serializer.is_valid(raise_exception=True)

        # Client Isolation Check
        client = serializer.validated_data.get("client")
        
        if client and not (
            client.created_by == company_root or
            client.created_by.parent_user == company_root
        ):
            raise PermissionDenied("Client does not belong to your company.")

        invoice = serializer.save()

        # Logic for Invoice Number & Totals
        
        invoice.invoice_number = generate_invoice_number()
        
        from .models import CompanyFinanceSettings

        # =========================
        # DEFAULT GST APPLY
        # =========================
        if not invoice.gst_rate or invoice.gst_rate == 0:
            company_settings = CompanyFinanceSettings.objects.filter(
                created_by=company_root
            ).first()

            if company_settings and company_settings.default_gst_rate:
                invoice.gst_rate = company_settings.default_gst_rate
                
        # calculate_invoice_totals logic will handle Billable Days vs Hourly
        subtotal, gst_amount, total_amount, gst_rate = calculate_invoice_totals(invoice)

        invoice.subtotal = subtotal
        invoice.gst_amount = gst_amount
        invoice.total_amount = total_amount
        invoice.gst_rate = gst_rate # Editable from settings or manual
        invoice.status = "GENERATED"
        invoice.save()

        # History Entry
        InvoiceHistory.objects.create(
            invoice=invoice,
            change_type="CREATED",
            new_data={"invoice_number": invoice.invoice_number},
            changed_by=user
        )

        return Response({
            "message": "Invoice created successfully",
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number
        })        

from rest_framework.generics import UpdateAPIView
from django.forms.models import model_to_dict
from .serializers import InvoiceUpdateSerializer
from decimal import Decimal
from datetime import date, datetime
from django.db.models.fields.files import FieldFile


def make_json_serializable(data):
    """
    Convert non-JSON types to JSON safe types
    """
    if isinstance(data, dict):
        return {k: make_json_serializable(v) for k, v in data.items()}

    elif isinstance(data, list):
        return [make_json_serializable(v) for v in data]

    elif isinstance(data, Decimal):
        return float(data)

    elif isinstance(data, (date, datetime)):
        return data.isoformat()

    elif isinstance(data, FieldFile):
        return data.url if data else None

    return data

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class UpdateInvoiceAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInvoiceOwnerOrReadOnly]

    def put(self, request, id):
        try:
            invoice = Invoice.objects.filter(id=id).first()

            if not invoice:
                return Response({"error": "Invoice not found"}, status=404)

            if invoice.created_by != request.user and invoice.created_by.parent_user != request.user:
                raise PermissionDenied("Invoice does not belong to your company.")

            serializer = InvoiceUpdateSerializer(invoice, data=request.data)
            serializer.is_valid(raise_exception=True)

            # Old snapshot
            old_data = make_json_serializable(model_to_dict(invoice))

            invoice = serializer.save()

            # Recalculate totals
            subtotal, gst_amount, total_amount, gst_rate = calculate_invoice_totals(invoice)
            invoice.subtotal = subtotal
            invoice.gst_amount = gst_amount
            invoice.total_amount = total_amount
            invoice.gst_rate = gst_rate
            invoice.save()

            # History
            InvoiceHistory.objects.create(
                invoice=invoice,
                change_type="UPDATED",
                old_data=old_data,
                new_data=make_json_serializable(model_to_dict(invoice)),
                changed_by=request.user
            )

            return Response(
                {
                    "message": "Invoice updated successfully",
                    "invoice_id": invoice.id
                },
                status=status.HTTP_200_OK
            )

        except Invoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        
from rest_framework.generics import UpdateAPIView
from django.forms.models import model_to_dict


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class UpdateInvoiceStatusAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInvoiceOwnerOrReadOnly]

    def patch(self, request, id):
        try:
            invoice = Invoice.objects.get(id=id)

            old_status = invoice.status
            new_status = request.data.get("status")

            if not new_status:
                return Response(
                    {"error": "Status is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            invoice.status = new_status
            invoice.save(update_fields=["status"])

            InvoiceHistory.objects.create(
                invoice=invoice,
                change_type="STATUS_CHANGED",
                old_data={"status": old_status},
                new_data={"status": new_status},
                changed_by=request.user
            )

            return Response(
                {
                    "message": "Invoice status updated successfully",
                    "invoice_id": invoice.id,
                    "status": invoice.status
                },
                status=status.HTTP_200_OK
            )

        except Invoice.DoesNotExist:
            return Response(
                {"error": "Invoice not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
                
from rest_framework.generics import RetrieveAPIView
from .serializers import InvoicePreviewSerializer


class InvoicePreviewAPIView(RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsInvoiceOwnerOrReadOnly]
    queryset = Invoice.objects.all()
    serializer_class = InvoicePreviewSerializer
    lookup_field = "id"
    
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Invoice, InvoiceHistory
from .services.pdf_generator import generate_invoice_pdf


# class GenerateInvoicePDFAPIView(APIView):
#     permission_classes = [IsAuthenticated, IsInvoiceOwnerOrReadOnly]

#     def post(self, request, id):
#         invoice = Invoice.objects.filter(id=id).first()

#         if not invoice:
#             return Response({"error": "Invoice not found"}, status=404)

#         pdf_url = generate_invoice_pdf(invoice,request)

#         InvoiceHistory.objects.create(
#             invoice=invoice,
#             change_type="PDF_REGENERATED",
#             new_data={"pdf": pdf_url},
#             changed_by=request.user
#         )

#         return Response({
#             "message": "PDF generated successfully",
#             "pdf_url": pdf_url
#         })
        
from django.db.models import Q

# class GenerateInvoicePDFAPIView(APIView):
#     permission_classes = [IsAuthenticated, IsInvoiceOwnerOrReadOnly]

#     def get_company_root(self, user):
#         if user.role == "SUB_ADMIN":
#             return user
#         if user.parent_user:
#             return user.parent_user
#         raise PermissionDenied("Invalid company structure.")

#     def post(self, request, id):
#         user = request.user
#         company_root = self.get_company_root(user)

#         try:
#             invoice = Invoice.objects.get(
#                 Q(created_by=company_root) |
#                 Q(created_by__parent_user=company_root),
#                 id=id
#             )
#         except Invoice.DoesNotExist:
#             return Response({"error": "Invoice not found"}, status=404)

#         pdf_url = generate_invoice_pdf(invoice, request)

#         InvoiceHistory.objects.create(
#             invoice=invoice,
#             change_type="PDF_REGENERATED",
#             new_data={"pdf": pdf_url},
#             changed_by=request.user
#         )

#         return Response({
#             "message": "PDF generated successfully",
#             "pdf_url": pdf_url
#         })

from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

class GenerateInvoicePDFAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInvoiceOwnerOrReadOnly]

    def get_company_root(self, user):
        if user.role == "SUB_ADMIN":
            return user
        
        if user.role == "ACCOUNTANT" and user.parent_user:
            return user.parent_user
        
        raise PermissionDenied("Only SubAdmin or Accountant allowed")

    def post(self, request, id):
        user = request.user
        company_root = self.get_company_root(user)

        try:
            invoice = Invoice.objects.get(
                id=id,
                created_by__in=[company_root] + list(
                    User.objects.filter(parent_user=company_root)
                )
            )
        except Invoice.DoesNotExist:
            return Response({"error": "Invoice not found"}, status=404)

        pdf_url = generate_invoice_pdf(invoice, request)

        InvoiceHistory.objects.create(
            invoice=invoice,
            change_type="PDF_REGENERATED",
            new_data={"pdf": pdf_url},
            changed_by=request.user
        )

        return Response({
            "message": "PDF generated successfully",
            "pdf_url": pdf_url
        })


from rest_framework.generics import ListAPIView
from .serializers import CandidateInvoiceHistorySerializer


class CandidateInvoiceHistoryAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CandidateInvoiceHistorySerializer

    def get_queryset(self):
        candidate_id = self.kwargs.get("candidate_id")
        
        user = self.request.user

        company_root = user if user.role == "SUB_ADMIN" else user.parent_user

        company_users = UserModel.objects.filter(
            Q(id=company_root.id) | Q(parent_user=company_root)
        )

        return Invoice.objects.filter(
            candidate_id=candidate_id,
            created_by__in=company_users
        ).order_by("-invoice_date")
        
        
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import PermissionDenied

UserModel = get_user_model()


class GlobalInvoiceListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceListSerializer

    def get_company_root(self, user):
        # 1. Agar SubAdmin hai toh wo khud owner hai
        if user.role == "SUB_ADMIN":
            return user
        
        # 2. Agar Accountant hai toh uska parent_user (SubAdmin) owner hai
        if user.role == "ACCOUNTANT" and user.parent_user:
            return user.parent_user
        
        # 3. Baaki roles (like EMPLOYEE) ke liye access mana hai
        raise PermissionDenied("Only Accountants or SubAdmins can manage Invoices.")


    def get_queryset(self):
        user = self.request.user
        company_root = self.get_company_root(user)

        # Company users (SubAdmin + all under him)
        company_users = UserModel.objects.filter(
            Q(id=company_root.id) | Q(parent_user=company_root)
        )

        qs = Invoice.objects.filter(
            created_by__in=company_users
        ).select_related("candidate").order_by("-created_at")

        # ===== Filters =====
        month = self.request.query_params.get("month")
        status_param = self.request.query_params.get("status")
        invoice_type = self.request.query_params.get("type")

        # ===== Search Filters =====
        search = self.request.query_params.get("search")

        if month:
            qs = qs.filter(billing_month=month)

        if status_param:
            qs = qs.filter(status=status_param)

        if invoice_type:
            qs = qs.filter(invoice_type=invoice_type)

        if search:
            qs = qs.filter(
                Q(invoice_number__icontains=search) |
                Q(candidate__candidate_name__icontains=search) |
                Q(items__candidate__candidate_name__icontains=search) |
                Q(bill_to_name__icontains=search)
            ).distinct()
            
        # ===== Date filter =====
        invoice_date = self.request.query_params.get("invoice_date")
        if invoice_date:
            qs = qs.filter(invoice_date=invoice_date)

        return qs
        

from rest_framework.generics import RetrieveUpdateAPIView
from .serializers import CompanyFinanceSettingsSerializer
from .models import CompanyFinanceSettings

from rest_framework.exceptions import PermissionDenied

class CompanyFinanceSettingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_company_root(self, user):
        # 1. Agar SubAdmin hai toh wo khud owner hai
        if user.role == "SUB_ADMIN":
            return user
        
        # 2. Agar Accountant hai toh uska parent_user (SubAdmin) owner hai
        if user.role == "ACCOUNTANT" and user.parent_user:
            return user.parent_user
        
        # 3. Baaki roles (like EMPLOYEE) ke liye access mana hai
        raise PermissionDenied("Only Accountants or SubAdmins can manage finance settings.")

    def get(self, request):
        # Accountant ko SubAdmin ka data dikhane ke liye root fetch karo
        company_root = self.get_company_root(request.user)
        
        obj, created = CompanyFinanceSettings.objects.get_or_create(
            created_by=company_root
        )
        serializer = CompanyFinanceSettingsSerializer(
            obj,
            context={"request": request}   
        )
        return Response(serializer.data)

    def put(self, request):
        company_root = self.get_company_root(request.user)
        
        obj, created = CompanyFinanceSettings.objects.get_or_create(
            created_by=company_root
        )

        # partial=True taaki agar sirf logo update karna ho toh baaki fields error na dein
        serializer = CompanyFinanceSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Company settings updated successfully"},
            status=status.HTTP_200_OK
        )