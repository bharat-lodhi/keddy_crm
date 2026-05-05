# services/calculations.py 

from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction

def calculate_invoice_totals(invoice):
    items = invoice.items.all()
    subtotal = Decimal("0.00")
    updated_items = []

    # Invoice level fields ke liye
    total_quantity = Decimal("0.00")
    total_rate = Decimal("0.00")
    invoice_amount = Decimal("0.00")

    for item in items:
        item_amount = Decimal("0.00")
        quantity = Decimal("0.00")
        rate = Decimal("0.00")

        # =========================
        # BILLABLE DAYS
        # =========================
        if item.billing_type == "BILLABLE_DAYS":
            if not item.total_days or item.total_days == 0:
                raise ValueError("Total days cannot be zero")
            
            rate = Decimal(str(item.monthly_rate))
            quantity = Decimal(str(item.working_days))
            item_amount = (rate / Decimal(str(item.total_days))) * quantity

        # =========================
        # HOURLY
        # =========================
        elif item.billing_type == "HOURLY":
            rate = Decimal(str(item.hourly_rate))
            quantity = Decimal(str(item.total_hours or 0))
            item_amount = rate * quantity

        # =========================
        # MANUAL
        # =========================
        else:
            item_amount = Decimal(str(item.amount or 0))
            rate = item_amount
            quantity = Decimal("1")

        # rounding
        item.amount = item_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        updated_items.append(item)

        subtotal += item.amount
        total_quantity += quantity
        invoice_amount += item_amount
        
        # Average rate calculation for invoice level
        if quantity > 0 and item_amount > 0:
            total_rate += rate

    # 🔥 BULK UPDATE ITEMS
    from invoicing.models import InvoiceItem
    if updated_items:
        InvoiceItem.objects.bulk_update(updated_items, ["amount"])

    # =========================
    # UPDATE INVOICE LEVEL FIELDS
    # =========================
    # quantity = total working days or total hours across all items
    invoice.quantity = total_quantity.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    
    # amount = total of all items (before GST)
    invoice.amount = invoice_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    
    # rate = average rate (total_amount / total_quantity) - fallback to 0
    if total_quantity > 0:
        invoice.rate = (invoice_amount / total_quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    else:
        invoice.rate = Decimal("0.00")

    # =========================
    # GST
    # =========================
    gst_rate = Decimal(str(invoice.gst_rate or 0))
    gst_amount = (subtotal * gst_rate) / Decimal("100")
    gst_amount = gst_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total_amount = (subtotal + gst_amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return subtotal, gst_amount, total_amount, gst_rate

