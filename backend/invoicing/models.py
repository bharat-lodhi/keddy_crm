from django.db import models
from django.conf import settings
from employee_portal.models import Candidate, Client, Vendor
User = settings.AUTH_USER_MODEL


class CompanyFinanceSettings(models.Model):
    # ============ COMPANY INFO ============
    company_name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    gstin = models.CharField(max_length=50)

    # ============ BRANDING ============
    logo = models.ImageField(upload_to="invoices/company/logo/", blank=True, null=True)
    signature = models.ImageField(upload_to="invoices/company/signature/", blank=True, null=True)

    # ============ TAX DEFAULTS ============
    default_gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    default_sac_code = models.CharField(max_length=50, blank=True, null=True)

    # ============ BANK DETAILS ============
    bank_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=100)
    ifsc_code = models.CharField(max_length=50)
    account_holder_name = models.CharField(max_length=255)

    # ============ DEFAULT TEXT ============
    default_terms = models.TextField(blank=True, null=True)

    # ============ SYSTEM ============
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="company_finance_settings"
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name
    
    



class Invoice(models.Model):
    # ========= TYPE =========
    class InvoiceType(models.TextChoices):
        CANDIDATE = "CANDIDATE", "Candidate Invoice"
        CUSTOM = "CUSTOM", "Custom Invoice"

    invoice_type = models.CharField(
        max_length=20,
        choices=InvoiceType.choices
    )

    # ========= IDENTITY =========
    invoice_number = models.CharField(max_length=50, unique=True)

    # ========= RELATIONS =========
    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices"
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # ========= BILL TO (SNAPSHOT) =========
    bill_to_name = models.CharField(max_length=255)
    bill_to_company = models.CharField(max_length=255, blank=True, null=True)
    bill_to_address = models.TextField(blank=True, null=True)
    bill_to_gstin = models.CharField(max_length=50, blank=True, null=True)
    bill_to_email = models.EmailField(blank=True, null=True)
    bill_to_phone = models.CharField(max_length=20, blank=True, null=True)

    # ========= SERVICE DETAILS =========
    description = models.TextField()
    sac_code = models.CharField(max_length=50, blank=True, null=True)
    rate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # ========= TAX =========
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    gst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # ========= DATES =========
    invoice_date = models.DateField()
    billing_month = models.DateField()
    due_date = models.DateField(blank=True, null=True)

    # ========= FILES =========
    pdf_file = models.FileField(upload_to="invoices/generated/", blank=True, null=True)
    external_invoice_file = models.FileField(upload_to="invoices/external/", blank=True, null=True)

    # ========= STATUS =========
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        GENERATED = "GENERATED", "Generated"
        SENT = "SENT", "Sent"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )

    # ========= EXTRA =========
    notes = models.TextField(blank=True, null=True)
    version = models.PositiveIntegerField(default=1)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_invoices"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.invoice_number
    
    
class InvoiceItem(models.Model):
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="items"
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    sac_code = models.CharField(max_length=50, blank=True, null=True)

    rate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.title}"
    
    

class InvoiceHistory(models.Model):
    class ChangeType(models.TextChoices):
        CREATED = "CREATED", "Created"
        UPDATED = "UPDATED", "Updated"
        STATUS_CHANGED = "STATUS_CHANGED", "Status Changed"
        PDF_REGENERATED = "PDF_REGENERATED", "PDF Regenerated"

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="history"
    )

    change_type = models.CharField(
        max_length=30,
        choices=ChangeType.choices
    )

    old_data = models.JSONField(blank=True, null=True)
    new_data = models.JSONField(blank=True, null=True)

    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.change_type}"