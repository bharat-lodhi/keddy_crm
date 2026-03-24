from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q, Sum
from rest_framework.exceptions import PermissionDenied


from .models import Invoice
from employee_portal.models import Candidate

UserModel = get_user_model()


class FinanceDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get_company_root(self, user):

        if user.role == "SUB_ADMIN":
            return user

        if user.parent_user:
            return user.parent_user

        raise PermissionDenied("Invalid company structure.")

    def get(self, request):

        user = request.user
        company_root = self.get_company_root(user)

        company_users = UserModel.objects.filter(
            Q(id=company_root.id) | Q(parent_user=company_root)
        )

        invoices = Invoice.objects.filter(
            created_by__in=company_users
        )

        # ========================
        # CLIENT REVENUE
        # ========================
        total_revenue = invoices.aggregate(
            total=Sum("total_amount")
        )["total"] or 0

        # ========================
        # VENDOR COST
        # ========================
        vendor_cost = 0

        for invoice in invoices:

            for item in invoice.items.all():

                if item.billing_type == "BILLABLE_DAYS":

                    if item.vendor_rate and item.total_days and item.working_days:

                        vendor_cost += (
                            item.working_days / item.total_days
                        ) * float(item.vendor_rate)

                elif item.billing_type == "HOURLY":

                    if item.vendor_rate and item.total_hours:

                        vendor_cost += float(item.vendor_rate) * float(item.total_hours)

        # ========================
        # PROFIT
        # ========================
        profit = float(total_revenue) - float(vendor_cost)

        # ========================
        # OUTSTANDING PAYMENTS
        # ========================
        outstanding = invoices.filter(
            status__in=["SENT", "PENDING", "PARTIALLY_PAID", "OVERDUE"]
        ).aggregate(
            total=Sum("total_amount")
        )["total"] or 0

        return Response({
            "total_client_revenue": round(total_revenue, 2),
            "total_vendor_cost": round(vendor_cost, 2),
            "total_profit": round(profit, 2),
            "outstanding_payments": round(outstanding, 2)
        })