from datetime import datetime
from django.db.models import Max
from invoicing.models import Invoice


def generate_invoice_number():
    """
    Format: INV-YYYY-####
    Example: INV-2026-0001
    """

    year = datetime.now().year
    prefix = f"INV-{year}-"

    # Find last invoice of this year
    last_invoice = (
        Invoice.objects
        .filter(invoice_number__startswith=prefix)
        .aggregate(max_no=Max("invoice_number"))
    )["max_no"]

    if last_invoice:
        last_serial = int(last_invoice.split("-")[-1])
        new_serial = last_serial + 1
    else:
        new_serial = 1

    invoice_number = f"{prefix}{str(new_serial).zfill(4)}"
    return invoice_number

