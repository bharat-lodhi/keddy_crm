from django.db import models
from django.conf import settings
from django.utils import timezone


# ==========================================
# 1️⃣ Google Calendar Account (Per User)
# ==========================================
class GoogleCalendarAccount(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="google_calendar_account"
    )
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_expiry = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_token_expired(self):
        return self.token_expiry <= timezone.now()

    def __str__(self):
        return f"{self.user.email} - Google Calendar"


# ==========================================
# 2️⃣ Candidate Calendar Event (1 Active Event Per Candidate)
# ==========================================
class CandidateCalendarEvent(models.Model):
    candidate = models.OneToOneField(
        "employee_portal.Candidate",
        on_delete=models.CASCADE,
        related_name="calendar_event"
    )

    google_event_id = models.CharField(max_length=255)

    event_title = models.CharField(max_length=255)
    event_description = models.TextField(blank=True, null=True)

    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()

    timezone = models.CharField(max_length=100, default="Asia/Kolkata")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_calendar_events"
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="updated_calendar_events"
    )

    is_cancelled = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Event for {self.candidate.candidate_name}"


# ==========================================
# 3️⃣ Calendar Event History (Audit Trail)
# ==========================================
from django.db import models
from django.conf import settings


class CandidateCalendarEventHistory(models.Model):

    class ActionType(models.TextChoices):
        CREATED = "CREATED", "Created"
        UPDATED = "UPDATED", "Updated"
        RESCHEDULED = "RESCHEDULED", "Rescheduled"
        CANCELLED = "CANCELLED", "Cancelled"

    event = models.ForeignKey(
        "calendar_service.CandidateCalendarEvent",
        on_delete=models.CASCADE,
        related_name="history"
    )

    action_type = models.CharField(
        max_length=20,
        choices=ActionType.choices
    )

    # ===== Previous Values Snapshot =====
    previous_title = models.CharField(max_length=255, null=True, blank=True)
    previous_description = models.TextField(null=True, blank=True)
    previous_start_datetime = models.DateTimeField(null=True, blank=True)
    previous_end_datetime = models.DateTimeField(null=True, blank=True)

    # ===== New Values Snapshot =====
    new_title = models.CharField(max_length=255, null=True, blank=True)
    new_description = models.TextField(null=True, blank=True)
    new_start_datetime = models.DateTimeField(null=True, blank=True)
    new_end_datetime = models.DateTimeField(null=True, blank=True)

    # ===== Who Changed =====
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="calendar_event_changes"
    )

    change_reason = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.action_type} - {self.event.candidate.candidate_name}"
    
    