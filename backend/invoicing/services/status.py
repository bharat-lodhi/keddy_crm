from datetime import date


def update_invoice_status(invoice):

    if invoice.status == "PAID":
        return

    total_paid = sum(p.amount for p in invoice.payments.all())

    # Fully paid
    if total_paid >= invoice.total_amount:
        invoice.status = "PAID"
        invoice.save(update_fields=["status"])
        return

    # Partial payment
    if total_paid > 0:
        invoice.status = "PARTIALLY_PAID"
        invoice.save(update_fields=["status"])
        return

    # No payment
    if invoice.due_date and invoice.due_date < date.today():
        invoice.status = "OVERDUE"
    else:
        invoice.status = "PENDING"

    invoice.save(update_fields=["status"])