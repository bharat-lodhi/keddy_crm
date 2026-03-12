from decimal import Decimal
from invoicing.models import CompanyFinanceSettings


def calculate_invoice_totals(invoice):
    """
    Calculates subtotal, GST amount and total amount
    GST priority:
    1. Invoice GST rate
    2. Company default GST
    3. Fallback 18%
    """

    items = invoice.items.all()
    subtotal = sum((item.amount for item in items), Decimal("0.00"))

    # GST Priority Logic
    gst_rate = invoice.gst_rate

    if not gst_rate:
        company = CompanyFinanceSettings.objects.first()
        gst_rate = company.default_gst_rate if company and company.default_gst_rate else Decimal("18.00")

    gst_amount = (subtotal * gst_rate) / Decimal("100.00")
    total_amount = subtotal + gst_amount

    subtotal = round(subtotal, 2)
    gst_amount = round(gst_amount, 2)
    total_amount = round(total_amount, 2)

    return subtotal, gst_amount, total_amount, gst_rate