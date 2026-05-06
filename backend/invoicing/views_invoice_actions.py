# views_invoice_actions.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import Invoice, InvoiceHistory
from .serializers import InvoiceStatusSerializer

UserModel = get_user_model()


class InvoiceStatusUpdateAPIView(APIView):
    """
    Update Invoice Status
    PATCH /api/invoices/<id>/status/
    """
    permission_classes = [IsAuthenticated]

    def get_company_root(self, user):
        if user.role == "SUB_ADMIN":
            return user
        if user.role == "ACCOUNTANT" and user.parent_user:
            return user.parent_user
        raise PermissionDenied("Only SubAdmin or Accountant can update invoice status")

    def get_invoice_for_company(self, invoice_id, company_root):
        """Get invoice only if it belongs to this company"""
        company_users = UserModel.objects.filter(
            Q(id=company_root.id) | Q(parent_user=company_root)
        ).values_list('id', flat=True)
        
        try:
            invoice = Invoice.objects.get(id=invoice_id, created_by__id__in=company_users)
            return invoice
        except Invoice.DoesNotExist:
            raise NotFound("Invoice not found or you don't have access")

    def patch(self, request, id):
        try:
            user = request.user
            company_root = self.get_company_root(user)
            invoice = self.get_invoice_for_company(id, company_root)
            
            old_status = invoice.status
            new_status = request.data.get("status")
            
            if not new_status:
                return Response(
                    {"error": "Status is required"},
                    status=400
                )
            
            # Validate status
            valid_statuses = ["DRAFT", "SENT", "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"]
            if new_status not in valid_statuses:
                return Response(
                    {"error": f"Invalid status. Choose from: {valid_statuses}"},
                    status=400
                )
            
            # If status is PAID, update payment_status also (for backward compatibility)
            if new_status == "PAID":
                invoice.payment_status = "PAID"
            
            invoice.status = new_status
            invoice.save(update_fields=["status", "payment_status", "updated_at"])
            
            # Create history entry
            InvoiceHistory.objects.create(
                invoice=invoice,
                change_type="STATUS_CHANGED",
                old_data={"status": old_status},
                new_data={"status": new_status},
                changed_by=user
            )
            
            return Response({
                "success": True,
                "message": f"Invoice status updated from {old_status} to {new_status}",
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "old_status": old_status,
                "new_status": new_status
            })
            
        except NotFound as e:
            return Response({"error": str(e)}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class InvoiceSoftDeleteAPIView(APIView):
    """
    Soft Delete Invoice (just mark as deleted, not actually removed from DB)
    DELETE /api/invoices/<id>/soft-delete/
    """
    permission_classes = [IsAuthenticated]

    def get_company_root(self, user):
        if user.role == "SUB_ADMIN":
            return user
        if user.role == "ACCOUNTANT" and user.parent_user:
            return user.parent_user
        raise PermissionDenied("Only SubAdmin or Accountant can delete invoices")

    def get_invoice_for_company(self, invoice_id, company_root):
        company_users = UserModel.objects.filter(
            Q(id=company_root.id) | Q(parent_user=company_root)
        ).values_list('id', flat=True)
        
        try:
            invoice = Invoice.objects.get(id=invoice_id, created_by__id__in=company_users)
            return invoice
        except Invoice.DoesNotExist:
            raise NotFound("Invoice not found or you don't have access")

    def delete(self, request, id):
        try:
            user = request.user
            company_root = self.get_company_root(user)
            invoice = self.get_invoice_for_company(id, company_root)
            
            # Check if already deleted
            if hasattr(invoice, 'is_deleted') and invoice.is_deleted:
                return Response(
                    {"error": "Invoice already deleted"},
                    status=400
                )
            
            # Store old data for history
            old_data = {
                "status": invoice.status,
                "is_deleted": False
            }
            
            # Soft delete - add is_deleted field if not exists
            # If is_deleted field doesn't exist, add it to model first
            if hasattr(invoice, 'is_deleted'):
                invoice.is_deleted = True
            else:
                # Alternative: change status to CANCELLED
                invoice.status = "CANCELLED"
            
            invoice.save(update_fields=["status", "updated_at"] if not hasattr(invoice, 'is_deleted') else ["is_deleted", "updated_at"])
            
            # Create history entry
            InvoiceHistory.objects.create(
                invoice=invoice,
                change_type="DELETED",
                old_data=old_data,
                new_data={"is_deleted": True, "deleted_by": user.email},
                changed_by=user
            )
            
            return Response({
                "success": True,
                "message": f"Invoice {invoice.invoice_number} soft deleted successfully",
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number
            })
            
        except NotFound as e:
            return Response({"error": str(e)}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class InvoiceHardDeleteAPIView(APIView):
    """
    Hard Delete Invoice (permanently remove from database)
    DELETE /api/invoices/<id>/hard-delete/
    """
    permission_classes = [IsAuthenticated]

    def get_company_root(self, user):
        if user.role == "SUB_ADMIN":
            return user
        if user.role == "ACCOUNTANT" and user.parent_user:
            return user.parent_user
        raise PermissionDenied("Only SubAdmin or Accountant can delete invoices")

    def get_invoice_for_company(self, invoice_id, company_root):
        company_users = UserModel.objects.filter(
            Q(id=company_root.id) | Q(parent_user=company_root)
        ).values_list('id', flat=True)
        
        try:
            invoice = Invoice.objects.get(id=invoice_id, created_by__id__in=company_users)
            return invoice
        except Invoice.DoesNotExist:
            raise NotFound("Invoice not found or you don't have access")

    def delete(self, request, id):
        try:
            user = request.user
            company_root = self.get_company_root(user)
            invoice = self.get_invoice_for_company(id, company_root)
            
            # Store invoice data for response
            invoice_number = invoice.invoice_number
            invoice_id = invoice.id
            
            # Delete related objects first (if any)
            # InvoiceHistory will be deleted automatically due to CASCADE
            # InvoiceItems will be deleted automatically due to CASCADE
            # InvoicePayments will be deleted automatically due to CASCADE
            
            # Hard delete
            invoice.delete()
            
            return Response({
                "success": True,
                "message": f"Invoice {invoice_number} permanently deleted from database",
                "invoice_id": invoice_id,
                "invoice_number": invoice_number
            })
            
        except NotFound as e:
            return Response({"error": str(e)}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


