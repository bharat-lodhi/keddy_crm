from datetime import datetime
from invoicing.models import Invoice

from django.db import transaction

def generate_invoice_number():
    year = datetime.now().year
    prefix = f"INV-{year}-"

    with transaction.atomic():
        last_invoice = (
            Invoice.objects
            .select_for_update()   # 🔥 LOCK
            .filter(invoice_number__startswith=prefix)
            .order_by("-id")       # ✅ SAFE
            .first()
        )

        if last_invoice and last_invoice.invoice_number:
            last_serial = int(last_invoice.invoice_number.split("-")[-1])
            new_serial = last_serial + 1
        else:
            new_serial = 1

        return f"{prefix}{str(new_serial).zfill(4)}"

