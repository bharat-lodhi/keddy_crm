from django.db import models
from django.conf import settings
from employee_portal.models import Candidate, Client, Vendor
User = settings.AUTH_USER_MODEL
from django.utils import timezone


class CompanyFinanceSettings(models.Model):

    # ============ COMPANY INFO ============
    company_name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    gstin = models.CharField(max_length=50)

    # ============ BRANDING ============
    # Company branding sab invoices me same rahegi
    logo = models.ImageField(upload_to="invoices/company/logo/", blank=True, null=True)
    signature = models.ImageField(upload_to="invoices/company/signature/", blank=True, null=True)

    # ============ TAX DEFAULTS ============
    default_gst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    default_sac_code = models.CharField(max_length=50, blank=True, null=True)

    # ============ DEFAULT TERMS ============
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
    
class CompanyBankAccount(models.Model):

    # Company owner (SubAdmin)
    company_owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="company_bank_accounts"
    )

    account_holder_name = models.CharField(max_length=255)
    bank_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=100)
    ifsc_code = models.CharField(max_length=50)
    branch = models.CharField(max_length=255, blank=True, null=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bank_name} - {self.account_number}"
    

class Invoice(models.Model):

    # ========= TYPE =========
    class InvoiceType(models.TextChoices):
        CANDIDATE = "CANDIDATE", "Candidate Invoice"
        CUSTOM = "CUSTOM", "Custom Invoice"

    invoice_type = models.CharField(
        max_length=20,
        choices=InvoiceType.choices
    )

    # ========= BILLING TYPE =========
    class BillingType(models.TextChoices):
        BILLABLE_DAYS = "BILLABLE_DAYS", "Billable Days"
        HOURLY = "HOURLY", "Hourly Billing"
        MANUAL = "MANUAL", "Manual Item"

    billing_type = models.CharField(
        max_length=20,
        choices=BillingType.choices,
        default=BillingType.MANUAL
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

    # ========= COMPANY BANK ACCOUNT =========
    company_bank_account = models.ForeignKey(
        CompanyBankAccount,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # ========= DOCUMENTS =========
    timesheet_file = models.FileField(
        upload_to="invoices/timesheets/",
        blank=True,
        null=True
    )

    client_sow = models.FileField(
        upload_to="invoices/client_sow/",
        blank=True,
        null=True
    )

    vendor_sow = models.FileField(
        upload_to="invoices/vendor_sow/",
        blank=True,
        null=True
    )

    # ========= BILL TO (SNAPSHOT) =========
    bill_to_name = models.CharField(max_length=255)
    bill_to_company = models.CharField(max_length=255, blank=True, null=True)
    bill_to_address = models.TextField(blank=True, null=True)
    bill_to_gstin = models.CharField(max_length=50, blank=True, null=True)
    bill_to_email = models.EmailField(blank=True, null=True)
    bill_to_phone = models.CharField(max_length=20, blank=True, null=True)

    # ========= SERVICE DETAILS =========
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
        SENT = "SENT", "Sent"
        PENDING = "PENDING", "Pending"
        PARTIALLY_PAID = "PARTIALLY_PAID", "Partially Paid"
        PAID = "PAID", "Paid"
        OVERDUE = "OVERDUE", "Overdue"
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
    
    
    # ========= NEW FIELDS FOR DASHBOARD =========
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ("PAID", "Paid"),
            ("PENDING", "Pending"),
            ("OVERDUE", "Overdue"),
        ],
        default="PENDING",
        blank=True,
        null=True
    )
    
    tds = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="TDS percentage (0-15%)"
    )
    
    vendor_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Cost paid to vendor for this invoice"
    )
    
    margin = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        blank=True
    )
    
    tds_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        blank=True
    )
    
    def save(self, *args, **kwargs):
        # Calculate TDS Amount
        self.tds_amount = (self.total_amount * self.tds) / 100 if self.tds else 0
        
        # Calculate Margin = Total Amount - Vendor Cost - TDS Amount
        self.margin = self.total_amount - (self.vendor_cost or 0) - (self.tds_amount or 0)
        
        # Update payment_status based on due_date (if overdue and not paid)
        if self.due_date and self.due_date < timezone.now().date():
            if self.payment_status != "PAID":
                self.payment_status = "OVERDUE"
        
        super().save(*args, **kwargs)
        
    # -------------------------------------

    def __str__(self):
        return self.invoice_number
    
    
class InvoiceItem(models.Model):

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="items"
    )

    # NEW → candidate optional hai (staff augmentation item)
    candidate = models.ForeignKey(
        Candidate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    sac_code = models.CharField(max_length=50, blank=True, null=True)

    # NEW → billing type
    billing_type = models.CharField(
        max_length=20,
        choices=Invoice.BillingType.choices,
        default=Invoice.BillingType.MANUAL
    )

    # ===== BILLABLE DAYS BILLING =====

    # NEW → monthly rate
    monthly_rate = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    # NEW → total days in month
    total_days = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    # NEW → actual working days (decimal to support half days like 21.5)
    working_days = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    # ===== HOURLY BILLING =====

    # NEW → hourly rate
    hourly_rate = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    # NEW → total hours
    total_hours = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    # ===== VENDOR COST (INTERNAL USE) =====

    # NEW → vendor rate
    vendor_rate = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    # NEW → client rate
    client_rate = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    # FINAL CALCULATED AMOUNT
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.title}"
    
    
class InvoicePayment(models.Model):

    class PaymentMode(models.TextChoices):
        BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"
        UPI = "UPI", "UPI"
        STRIPE = "STRIPE", "Stripe"
        RAZORPAY = "RAZORPAY", "Razorpay"
        CASH = "CASH", "Cash"

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    payment_date = models.DateField()

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    payment_mode = models.CharField(
        max_length=20,
        choices=PaymentMode.choices
    )

    reference_number = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    notes = models.TextField(blank=True, null=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.amount}"
    

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
    
