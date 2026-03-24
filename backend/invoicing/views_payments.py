from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from .models import InvoicePayment, Invoice
from .serializers import InvoicePaymentSerializer
from .services.status import update_invoice_status

UserModel = get_user_model()


class InvoicePaymentListCreateAPIView(ListCreateAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = InvoicePaymentSerializer

    def get_company_root(self, user):

        if user.role == "SUB_ADMIN":
            return user

        if user.parent_user:
            return user.parent_user

        raise PermissionDenied("Invalid company structure.")

    def get_queryset(self):

        user = self.request.user
        company_root = self.get_company_root(user)

        company_users = UserModel.objects.filter(
            Q(id=company_root.id) | Q(parent_user=company_root)
        )

        return InvoicePayment.objects.filter(
            invoice__created_by__in=company_users
        ).order_by("-created_at")

    def perform_create(self, serializer):

        user = self.request.user
        company_root = self.get_company_root(user)

        invoice = serializer.validated_data["invoice"]

        if invoice.created_by != company_root and invoice.created_by.parent_user != company_root:
            raise PermissionDenied("Invoice does not belong to your company.")

        payment = serializer.save(created_by=user)

        # =========================
        # UPDATE INVOICE STATUS
        # =========================
        invoice = payment.invoice

        update_invoice_status(invoice)