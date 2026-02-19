from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Vendor(models.Model):
    # ================= REQUIRED FIELDS =================
    name = models.CharField(max_length=255)
    number = models.CharField(max_length=15)
    company_name = models.CharField(max_length=255)

    # ================= OPTIONAL FIELDS =================
    email = models.EmailField(blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)
    company_pan_or_reg_no = models.CharField(
        max_length=100, blank=True, null=True
    )

    # ================= POC DETAILS =================
    poc1_name = models.CharField(max_length=255, blank=True, null=True)
    poc1_number = models.CharField(max_length=15, blank=True, null=True)

    poc2_name = models.CharField(max_length=255, blank=True, null=True)
    poc2_number = models.CharField(max_length=15, blank=True, null=True)

    # ================= BUSINESS DETAILS =================
    top_3_clients = models.TextField(blank=True, null=True)
    no_of_bench_developers = models.PositiveIntegerField(blank=True, null=True)
    provide_onsite = models.BooleanField(default=False)
    onsite_location = models.CharField(
        max_length=255, blank=True, null=True
    )
    specialized_tech_developers = models.TextField(blank=True, null=True)

    # ================= DOCUMENT =================
    bench_list = models.FileField(
        upload_to="vendor/bench_list/",
        blank=True,
        null=True
    )

    # ================= SYSTEM FIELDS =================
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="vendors"
    )
    
    created_by = models.ForeignKey(
        User,
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name="created_vendor"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} - {self.name}"


class Client(models.Model):
    client_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_clients"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client_name} - {self.company_name}"
    
    

from django.db import models
from django.conf import settings
from employee_portal.models import Vendor, Client

User = settings.AUTH_USER_MODEL


class Candidate(models.Model):
    class RateType(models.TextChoices):
        LPM = "LPM", "LPM"
        KPM = "KPM", "KPM"
        PHR = "PHR", "PHR"
        LPA = "LPA", "LPA"

    # ================= RESUME =================
    resume = models.FileField(upload_to="candidates/resumes/", blank=True, null=True)

    # ================= CANDIDATE DETAILS =================
    candidate_name = models.CharField(max_length=255)
    candidate_email = models.EmailField(blank=True, null=True)
    candidate_number = models.CharField(max_length=20,blank=True, null=True)

    years_of_experience_manual = models.CharField(max_length=10000,blank=True, null=True)
    years_of_experience_calculated = models.FloatField(blank=True, null=True)

    skills = models.TextField(blank=True, null=True)
    technology = models.CharField(max_length=10055, blank=True, null=True)

    # ================= VENDOR DETAILS =================
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, related_name="candidates")
    vendor_company_name = models.CharField(max_length=255, blank=True, null=True)
    vendor_number = models.CharField(max_length=20, blank=True, null=True)
    vendor_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    vendor_rate_type = models.CharField(
        max_length=10,
        choices=RateType.choices,
        blank=True,
        null=True
    )

    # ================= CLIENT DETAILS =================
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name="candidates")
    client_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    client_rate_type = models.CharField(
        max_length=10,
        choices=RateType.choices,
        blank=True,
        null=True
    )
    # ================= INTERNAL SUBMISSION =================
    submitted_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_candidates"
    )

    # ================= STATUS =================
    class MainStatus(models.TextChoices):
        SUBMITTED = "SUBMITTED", "Submitted"
        SCREENING = "SCREENING", "Screening"
        L1 = "L1", "L1"
        L2 = "L2", "L2"
        L3 = "L3", "L3"
        OTHER = "OTHER", "Other"
        OFFERED = "OFFERED","Offered"
        ONBORD = "ONBORD", "onbord"
        ON_HOLD  ="ON_HOLD", "On Hold"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"
        REJECTED ="REJECTED","Rejected"


    class SubStatus(models.TextChoices):
        NONE = "NONE", "None"
        SCHEDULED = "SCHEDULED","Scheduled"
        COMPLETED = "COMPLETED","Completed"
        FEEDBACK_PENDING = "FEEDBACK_PENDING", "Feedback Pending"
        CLEARED = "CLEARED" , "CLEARED"
        REJECTED = "REJECTED","Rejected"
        POSTPONED = "POSTPONED","Postponed"
        NO_SHOW = "NO_SHOW" , "No Show"
        ON_HOLD  ="ON_HOLD", "On Hold"
        INTERVIEW_PENDING = "INTERVIEW_PENDING" , "Interview Pending"

        # WAIT_FOR_THE_UPDATE = "WAIT_FOR_THE_UPDATE","Wait For The Update"
        

    main_status = models.CharField(max_length=100, choices=MainStatus.choices, default=MainStatus.SUBMITTED)
    sub_status = models.CharField(max_length=100, choices=SubStatus.choices, default=SubStatus.NONE)

    # ================= VERIFICATION =================
    verification_status = models.BooleanField(default=False)

    # ================= BLACKLIST =================
    is_blocklisted = models.BooleanField(default=False)
    blocklisted_reason = models.TextField(blank=True, null=True)

    # ================= TRACKING =================
    remark = models.TextField(blank=True, null=True)
    extra_details = models.TextField(blank=True, null=True)

    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="changed_candidates"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    created_by = models.ForeignKey(
        User,
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name="created_candidates"
    )

    def __str__(self):
        return self.candidate_name


# ================= STATUS HISTORY =================
class CandidateStatusHistory(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name="status_history")
    old_status = models.CharField(max_length=50, blank=True, null=True)
    new_status = models.CharField(max_length=50)
    sub_status = models.CharField(max_length=50, blank=True, null=True)

    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)


# ================= REMARK HISTORY =================
class CandidateRemarkHistory(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name="remark_history")
    remark = models.TextField()

    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
