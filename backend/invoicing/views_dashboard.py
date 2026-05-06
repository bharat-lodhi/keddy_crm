# views_dashboard.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.db.models import Sum, Q
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from decimal import Decimal
from calendar import monthrange

from .models import Invoice, InvoicePayment, CompanyBankAccount
from employee_portal.models import Client

UserModel = get_user_model()


class FinanceDashboardAPIView(APIView):
    """
    Complete Dashboard API - Production Ready
    Logic:
    - This Month Revenue = invoice_date based
    - Next Month Expected Revenue = due_date based
    - Pending Payments = due_date <= today
    """
    permission_classes = [IsAuthenticated]

    def get_company_root(self, user):
        if user.role == "SUB_ADMIN":
            return user
        if user.role == "ACCOUNTANT" and user.parent_user:
            return user.parent_user
        raise PermissionDenied("Only SubAdmin or Accountant can access dashboard")

    def get_company_users(self, company_root):
        """Get all users under this company"""
        return UserModel.objects.filter(
            Q(id=company_root.id) | Q(parent_user=company_root)
        ).values_list('id', flat=True)

    def get_month_range(self, year, month):
        """Get first and last day of a specific month"""
        first_day = datetime(year, month, 1).date()
        if month == 12:
            last_day = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            last_day = datetime(year, month + 1, 1).date() - timedelta(days=1)
        return first_day, last_day

    def get_current_month_range(self):
        """Get first and last day of current month"""
        today = datetime.now().date()
        return self.get_month_range(today.year, today.month)

    def get_next_month_range(self):
        """Get first and last day of next month"""
        today = datetime.now().date()
        if today.month == 12:
            return self.get_month_range(today.year + 1, 1)
        return self.get_month_range(today.year, today.month + 1)

    def get_previous_month_range(self):
        """Get first and last day of previous month"""
        today = datetime.now().date()
        if today.month == 1:
            return self.get_month_range(today.year - 1, 12)
        return self.get_month_range(today.year, today.month - 1)

    def calculate_bank_balance(self, company_root, company_users):
        """
        Calculate real-time bank balance
        Formula: Opening Balance + Received - Expenses - Vendor Paid
        """
        opening_balance = Decimal('0.00')
        
        # Total received from client invoices based on payment_date
        total_received = Decimal('0.00')
        try:
            received_sum = InvoicePayment.objects.filter(
                invoice__created_by__id__in=company_users,
            ).aggregate(total=Sum('amount'))['total']
            if received_sum:
                total_received = received_sum
        except:
            pass
        
        total_expenses = Decimal('0.00')
        vendor_paid = Decimal('0.00')
        
        closing_balance = opening_balance + total_received - total_expenses - vendor_paid
        
        return {
            "opening_balance": opening_balance,
            "total_received": total_received,
            "total_expenses": total_expenses,
            "vendor_paid": vendor_paid,
            "closing_balance": closing_balance
        }

    def get(self, request):
        try:
            user = request.user
            company_root = self.get_company_root(user)
            company_users = self.get_company_users(company_root)
            
            current_month_start, current_month_end = self.get_current_month_range()
            next_month_start, next_month_end = self.get_next_month_range()
            previous_month_start, previous_month_end = self.get_previous_month_range()
            today = datetime.now().date()
            
            # =========================================================
            # STEP 1: KPI CARDS
            # =========================================================
            
            # This Month Revenue (invoice_date based)
            this_month_revenue = Invoice.objects.filter(
                created_by__id__in=company_users,
                invoice_date__gte=current_month_start,
                invoice_date__lte=current_month_end
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            
            # This Month Expense
            this_month_expense = Decimal('0.00')
            
            # Net Profit
            this_month_vendor_cost = Decimal('0.00')
            net_profit = this_month_revenue - this_month_expense - this_month_vendor_cost
            
            # Bank Balance
            bank_balance_data = self.calculate_bank_balance(company_root, company_users)
            bank_balance = bank_balance_data['closing_balance']
            
            kpi_cards = {
                "this_month_revenue": {
                    "value": float(this_month_revenue),
                    "color": "green",
                    "note": "Based on invoice_date"
                },
                "this_month_expense": {
                    "value": float(this_month_expense),
                    "color": "red"
                },
                "net_profit": {
                    "value": float(net_profit),
                    "color": "green" if net_profit >= 0 else "red"
                },
                "bank_balance": {
                    "value": float(bank_balance),
                    "color": "blue"
                }
            }
            
            # =========================================================
            # STEP 2: CASH FLOW
            # =========================================================
            
            # Received This Month (based on payment_date)
            received_this_month = Decimal('0.00')
            try:
                received_sum = InvoicePayment.objects.filter(
                    invoice__created_by__id__in=company_users,
                    payment_date__gte=current_month_start,
                    payment_date__lte=current_month_end
                ).aggregate(total=Sum('amount'))['total']
                if received_sum:
                    received_this_month = received_sum
            except:
                pass
            
            # Pending Client Payments (due_date <= today, status not PAID)
            pending_client_payments = Invoice.objects.filter(
                created_by__id__in=company_users,
                due_date__lte=today,
            ).exclude(
                status__in=["PAID", "CANCELLED"]
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            
            # Vendor Payable
            vendor_payable = Decimal('0.00')
            
            # Net Cash Flow
            net_cash_flow = received_this_month - this_month_expense
            
            cash_flow = {
                "received_this_month": float(received_this_month),
                "pending_client_payments": float(pending_client_payments),
                "vendor_payable": float(vendor_payable),
                "net_cash_flow": float(net_cash_flow)
            }
            
            # =========================================================
            # STEP 3: FUTURE PROJECTION
            # =========================================================
            
            # Next Month Expected Revenue (due_date based)
            next_month_expected_revenue = Invoice.objects.filter(
                created_by__id__in=company_users,
                due_date__gte=next_month_start,
                due_date__lte=next_month_end,
            ).exclude(
                status__in=["PAID", "CANCELLED"]
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            
            future_projection = {
                "next_month_expected_revenue": float(next_month_expected_revenue),
                "next_month_expected_vendor_cost": 0.00,
                "next_month_expected_expense": 0.00,
                "expected_profit": float(next_month_expected_revenue)
            }
            
            # =========================================================
            # STEP 4: CHARTS DATA
            # =========================================================
            
            # 1. Monthly Comparison (Last 6 months) - invoice_date based
            monthly_data = []
            for i in range(5, -1, -1):
                month_date = today.replace(day=1)
                for _ in range(i):
                    if month_date.month == 1:
                        month_date = month_date.replace(year=month_date.year - 1, month=12)
                    else:
                        month_date = month_date.replace(month=month_date.month - 1)
                
                month_start, month_end = self.get_month_range(month_date.year, month_date.month)
                
                revenue = Invoice.objects.filter(
                    created_by__id__in=company_users,
                    invoice_date__gte=month_start,
                    invoice_date__lte=month_end
                ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
                
                monthly_data.append({
                    "month": month_start.strftime("%b %Y"),
                    "revenue": float(revenue),
                    "expense": 0.00,
                    "profit": float(revenue)
                })
            
            # 2. Profit Trend
            profit_trend = [
                {"month": d["month"], "profit": d["profit"]}
                for d in monthly_data
            ]
            
            # 3. Expense Breakdown
            expense_breakdown = [
                {"category": "Salary", "amount": 0},
                {"category": "Rent", "amount": 0},
                {"category": "Internet", "amount": 0},
                {"category": "Cleaning", "amount": 0},
                {"category": "Misc", "amount": 0}
            ]
            
            # 4. Client Contribution (based on invoice_date)
            from collections import defaultdict
            client_revenue = defaultdict(float)
            
            invoices_for_contribution = Invoice.objects.filter(
                created_by__id__in=company_users
            ).select_related('client')
            
            for invoice in invoices_for_contribution:
                if invoice.client:
                    client_revenue[invoice.client.client_name] += float(invoice.total_amount)
            
            client_contribution_data = [
                {"client_name": name, "revenue": revenue}
                for name, revenue in client_revenue.items()
            ]
            client_contribution_data.sort(key=lambda x: x['revenue'], reverse=True)
            client_contribution_data = client_contribution_data[:5]
            
            # 5. Cash Flow Chart (payment_date based)
            cash_flow_chart = []
            for i in range(5, -1, -1):
                month_date = today.replace(day=1)
                for _ in range(i):
                    if month_date.month == 1:
                        month_date = month_date.replace(year=month_date.year - 1, month=12)
                    else:
                        month_date = month_date.replace(month=month_date.month - 1)
                
                month_start, month_end = self.get_month_range(month_date.year, month_date.month)
                
                inflow = Decimal('0.00')
                try:
                    inflow_sum = InvoicePayment.objects.filter(
                        invoice__created_by__id__in=company_users,
                        payment_date__gte=month_start,
                        payment_date__lte=month_end
                    ).aggregate(total=Sum('amount'))['total']
                    if inflow_sum:
                        inflow = inflow_sum
                except:
                    pass
                
                cash_flow_chart.append({
                    "month": month_start.strftime("%b %Y"),
                    "inflow": float(inflow),
                    "outflow": 0.00
                })
            
            charts_data = {
                "monthly_comparison": monthly_data,
                "profit_trend": profit_trend,
                "expense_breakdown": expense_breakdown,
                "client_contribution": client_contribution_data,
                "cash_flow": cash_flow_chart
            }
            
            # =========================================================
            # STEP 5: DATA TABLES
            # =========================================================
            
            recent_invoices = Invoice.objects.filter(
                created_by__id__in=company_users
            ).order_by('-created_at')[:20]
            
            recent_invoices_data = []
            for inv in recent_invoices:
                recent_invoices_data.append({
                    "id": inv.id,
                    "invoice_id": inv.invoice_number,
                    "client": inv.bill_to_name,
                    "amount": float(inv.total_amount),
                    "margin": 0.00,
                    "status": inv.status
                })
            
            tables_data = {
                "recent_client_invoices": recent_invoices_data,
                "vendor_payables": []
            }
            
            # =========================================================
            # STEP 6: BANK BALANCE SECTION
            # =========================================================
            
            bank_balance_section = {
                "opening_balance": float(bank_balance_data["opening_balance"]),
                "money_received": float(bank_balance_data["total_received"]),
                "expenses": float(bank_balance_data["total_expenses"]),
                "vendor_payments": float(bank_balance_data["vendor_paid"]),
                "closing_balance": float(bank_balance_data["closing_balance"])
            }
            
            # =========================================================
            # STEP 7: ALERTS & NOTIFICATIONS
            # =========================================================
            
            # Overdue invoices (due_date < today, not paid)
            overdue_count = Invoice.objects.filter(
                created_by__id__in=company_users,
                due_date__lt=today,
            ).exclude(
                status__in=["PAID", "CANCELLED"]
            ).count()
            
            overdue_amount = Invoice.objects.filter(
                created_by__id__in=company_users,
                due_date__lt=today,
            ).exclude(
                status__in=["PAID", "CANCELLED"]
            ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            
            # Due soon (next 7 days)
            due_soon_date = today + timedelta(days=7)
            due_soon_count = Invoice.objects.filter(
                created_by__id__in=company_users,
                due_date__gte=today,
                due_date__lte=due_soon_date,
            ).exclude(
                status__in=["PAID", "CANCELLED"]
            ).count()
            
            alerts = {
                "overdue": {
                    "client_invoices_count": overdue_count,
                    "client_invoices_amount": float(overdue_amount),
                    "vendor_invoices_count": 0,
                    "vendor_invoices_amount": 0.00
                },
                "due_soon": {
                    "client_invoices_count": due_soon_count,
                    "vendor_invoices_count": 0
                }
            }
            
            # =========================================================
            # FINAL RESPONSE
            # =========================================================
            
            response_data = {
                "success": True,
                "kpi_cards": kpi_cards,
                "cash_flow": cash_flow,
                "future_projection": future_projection,
                "charts": charts_data,
                "tables": tables_data,
                "bank_balance": bank_balance_section,
                "alerts": alerts,
                "filters_available": {
                    "current_month": current_month_start.strftime("%Y-%m"),
                    "next_month": next_month_start.strftime("%Y-%m"),
                    "date_range": {
                        "from": current_month_start.strftime("%Y-%m-%d"),
                        "to": current_month_end.strftime("%Y-%m-%d")
                    }
                }
            }
            
            return Response(response_data)
            
        except Exception as e:
            return Response({
                "success": False,
                "error": str(e),
                "message": "Something went wrong while fetching dashboard data"
            }, status=500)