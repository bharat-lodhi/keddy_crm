from decimal import Decimal, ROUND_HALF_UP
from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction

def calculate_invoice_totals(invoice):
    items = invoice.items.all()
    subtotal = Decimal("0.00")

    updated_items = []

    for item in items:
        item_amount = Decimal("0.00")

        # =========================
        # BILLABLE DAYS
        # =========================
        if item.billing_type == "BILLABLE_DAYS":
            if not item.total_days or item.total_days == 0:
                raise ValueError("Total days cannot be zero")

            item_amount = (
                Decimal(str(item.monthly_rate)) / Decimal(str(item.total_days))
            ) * Decimal(str(item.working_days))

        # =========================
        # HOURLY
        # =========================
        elif item.billing_type == "HOURLY":
            item_amount = Decimal(str(item.hourly_rate)) * Decimal(str(item.total_hours))

        # =========================
        # MANUAL
        # =========================
        else:
            item_amount = Decimal(str(item.amount or 0))

        # rounding
        item.amount = item_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        updated_items.append(item)

        subtotal += item.amount

    # 🔥 BULK UPDATE (FAST)
    from invoicing.models import InvoiceItem
    InvoiceItem.objects.bulk_update(updated_items, ["amount"])

    # =========================
    # GST
    # =========================
    gst_rate = Decimal(str(invoice.gst_rate or 0))
    gst_amount = (subtotal * gst_rate) / Decimal("100")

    gst_amount = gst_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total_amount = (subtotal + gst_amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return subtotal, gst_amount, total_amount, gst_rate






# def calculate_invoice_totals(invoice):
#     items = invoice.items.all()
#     subtotal = Decimal("0.00")

#     for item in items:
#         item_amount = Decimal("0.00")

#         # 1. BILLABLE DAYS BILLING
#         if item.billing_type == "BILLABLE_DAYS":
#             if item.monthly_rate and item.total_days and item.working_days:
#                 # Formula: (Rate / Total Days) * Working Days
#                 item_amount = (
#                     Decimal(str(item.monthly_rate)) / Decimal(str(item.total_days))
#                 ) * Decimal(str(item.working_days))

#         # 2. HOURLY BILLING
#         elif item.billing_type == "HOURLY":
#             if item.hourly_rate and item.total_hours:
#                 item_amount = Decimal(str(item.hourly_rate)) * Decimal(str(item.total_hours))

#         # 3. MANUAL / FIXED ITEM (Laptop, Server Cost, etc.)
#         else:
#             # Agar user ne seedha amount bhara hai toh use hi use karein
#             if item.amount:
#                 item_amount = Decimal(str(item.amount))

#         # Item amount ko 2 decimal places tak round karein
#         item.amount = item_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
#         item.save()

#         subtotal += item.amount

#     # GST Logic
#     gst_rate = Decimal(str(invoice.gst_rate)) if invoice.gst_rate else Decimal("0.00")
#     gst_amount = (subtotal * gst_rate) / Decimal("100")
    
#     # Rounding totals
#     gst_amount = gst_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
#     total_amount = (subtotal + gst_amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

#     return subtotal, gst_amount, total_amount, gst_rate



