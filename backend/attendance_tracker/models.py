from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class CompanySettings(models.Model):
    """Per company settings - Sub-Admin controlled"""
    company = models.OneToOneField(User, on_delete=models.CASCADE, related_name="settings", limit_choices_to={'role': 'SUB_ADMIN'})
    
    # Office timing
    office_start_time = models.TimeField(default="10:00:00")
    late_threshold_minutes = models.PositiveIntegerField(default=15)  # After this considered late
    office_end_time = models.TimeField(default="19:00:00")
    
    # Default targets (can be overridden per user daily)
    default_sourcing_target = models.PositiveIntegerField(default=5)
    default_submission_target = models.PositiveIntegerField(default=2)
    
    # Streak settings
    streak_bonus_thresholds = models.JSONField(default=list)  # e.g., [5, 10, 20]
    streak_bonus_points = models.JSONField(default=list)  # e.g., [5, 10, 20]
    
    # Attendance
    allow_home_checkin = models.BooleanField(default=False)
    require_location = models.BooleanField(default=False)
    
    # Performance
    top_performer_threshold = models.FloatField(default=80.0)
    #------------ points -----------
    points_on_time = models.IntegerField(default=1)
    points_late = models.IntegerField(default=-2)
    points_absent = models.IntegerField(default=-5)
    points_no_report = models.IntegerField(default=-3)
    points_green = models.IntegerField(default=10)
    points_orange = models.IntegerField(default=5)
    points_red = models.IntegerField(default=-5)
    points_onboarding = models.IntegerField(default=10)
    points_multiple_onboarding = models.IntegerField(default=25)
    points_weekly_submission = models.IntegerField(default=10)
    points_weekly_interview = models.IntegerField(default=5)
    points_pipeline = models.IntegerField(default=3)
    points_streak_broken = models.IntegerField(default=-10)
    points_leave_unpaid = models.IntegerField(default=-5)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Settings - {self.company.email}"


class Attendance(models.Model):
    class Status(models.TextChoices):
        ON_TIME = "ON_TIME", "On Time"
        LATE = "LATE", "Late"
        ABSENT = "ABSENT", "Absent"
        HALF_DAY = "HALF_DAY", "Half Day"
    
    class WorkFrom(models.TextChoices):
        OFFICE = "OFFICE", "Office"
        HOME = "HOME", "Home"
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")
    date = models.DateField(default=timezone.now)
    
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ABSENT)
    work_from = models.CharField(max_length=10, choices=WorkFrom.choices, default=WorkFrom.OFFICE)
    
    late_reason = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_attendances", limit_choices_to={'role': 'SUB_ADMIN'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['company', 'user', 'date']),
            models.Index(fields=['company', 'date']),
        ]
        
    @classmethod
    def calculate_status(cls, check_in_time, company):
        """Auto calculate status based on company office time"""
        settings = CompanySettings.objects.get(company=company)
        office_start = settings.office_start_time
        late_threshold = settings.late_threshold_minutes
        
        # Convert to time only for comparison
        check_in_time_only = check_in_time.time()
        
        # Calculate late minutes
        from datetime import datetime, timedelta
        office_start_dt = datetime.combine(datetime.today(), office_start)
        check_in_dt = datetime.combine(datetime.today(), check_in_time_only)
        diff_minutes = (check_in_dt - office_start_dt).total_seconds() / 60
        
        if diff_minutes <= late_threshold:
            return cls.Status.ON_TIME
        else:
            return cls.Status.LATE
    
    def __str__(self):
        return f"{self.user.email} - {self.date} - {self.status}"


class DailyWorkReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="daily_reports")
    date = models.DateField(default=timezone.now)
    
    work_done = models.TextField()
    challenges = models.TextField(blank=True, null=True)
    plan_for_tomorrow = models.TextField()
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_reports", limit_choices_to={'role': 'SUB_ADMIN'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['company', 'user', 'date']),
            models.Index(fields=['company', 'date']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.date}"


class Leave(models.Model):
    class Type(models.TextChoices):
        PAID = "PAID", "Paid Leave"
        UNPAID = "UNPAID", "Unpaid Leave"
        SICK = "SICK", "Sick Leave"
        CASUAL = "CASUAL", "Casual Leave"
    
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="leaves")
    start_date = models.DateField()
    end_date = models.DateField()
    leave_type = models.CharField(max_length=20, choices=Type.choices, default=Type.CASUAL)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="approved_leaves")
    approved_at = models.DateTimeField(blank=True, null=True)
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_leaves", limit_choices_to={'role': 'SUB_ADMIN'})
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['company', 'user', 'start_date']),
            models.Index(fields=['company', 'status']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.start_date} to {self.end_date}"


class Holiday(models.Model):
    date = models.DateField()
    name = models.CharField(max_length=100)
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_holidays", limit_choices_to={'role': 'SUB_ADMIN'})
    
    class Meta:
        unique_together = ['date', 'company']
        ordering = ['date']
    
    def __str__(self):
        return f"{self.name} - {self.date}"


class DailyTarget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="daily_targets")
    date = models.DateField(default=timezone.now)
    
    target_sourcing = models.PositiveIntegerField(default=5)
    target_submission = models.PositiveIntegerField(default=2)
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_targets", limit_choices_to={'role': 'SUB_ADMIN'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['company', 'user', 'date']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.date} - S:{self.target_sourcing}/Sub:{self.target_submission}"


class PerformanceTracker(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="performance_trackers")
    date = models.DateField(default=timezone.now)
    month = models.CharField(max_length=7, blank=True, editable=False)  # Format: YYYY-MM
    
    sourced_today = models.PositiveIntegerField(default=0)
    submitted_today = models.PositiveIntegerField(default=0)
    
    # Monthly cumulative
    monthly_sourced = models.PositiveIntegerField(default=0)
    monthly_submitted = models.PositiveIntegerField(default=0)
    
    # Overall cumulative
    total_sourced = models.PositiveIntegerField(default=0)
    total_submitted = models.PositiveIntegerField(default=0)
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_performance", limit_choices_to={'role': 'SUB_ADMIN'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['company', 'user', 'date']),
            models.Index(fields=['company', 'month']),
            models.Index(fields=['user', 'month']),
        ]
    
    def save(self, *args, **kwargs):
        self.month = self.date.strftime("%Y-%m")
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.email} - {self.date} - S:{self.sourced_today}/Sub:{self.submitted_today}"
    
    @property
    def color_code(self):
        target = DailyTarget.objects.filter(user=self.user, date=self.date).first()
        if not target:
            return "RED"
        
        sourcing_met = self.sourced_today >= target.target_sourcing
        submission_met = self.submitted_today >= target.target_submission
        
        if sourcing_met and submission_met:
            return "GREEN"
        elif sourcing_met or submission_met:
            return "ORANGE"
        return "RED"
    
    @property
    def performance_percentage(self):
        target = DailyTarget.objects.filter(user=self.user, date=self.date).first()
        if not target:
            return 0
        
        sourcing_percent = min(100, (self.sourced_today / target.target_sourcing) * 100) if target.target_sourcing > 0 else 100
        submission_percent = min(100, (self.submitted_today / target.target_submission) * 100) if target.target_submission > 0 else 100
        
        return (sourcing_percent + submission_percent) / 2
    
    @property
    def is_top_performer(self):
        return self.performance_percentage >= 80


class MonthlyPerformanceSummary(models.Model):
    """Monthly summary for quick admin dashboard"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="monthly_summaries")
    month = models.CharField(max_length=7)  # YYYY-MM
    year = models.IntegerField()
    
    total_sourced = models.PositiveIntegerField(default=0)
    total_submitted = models.PositiveIntegerField(default=0)
    total_present_days = models.PositiveIntegerField(default=0)
    total_late_days = models.PositiveIntegerField(default=0)
    total_absent_days = models.PositiveIntegerField(default=0)
    total_leaves_taken = models.PositiveIntegerField(default=0)
    
    avg_performance_percentage = models.FloatField(default=0)
    streak_achieved = models.BooleanField(default=False)
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_monthly_summaries", limit_choices_to={'role': 'SUB_ADMIN'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'month']
        ordering = ['-year', '-month']
        indexes = [
            models.Index(fields=['company', 'user', 'month']),
            models.Index(fields=['company', 'year', 'month']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.month}"


class BonusPoints(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bonus_points")
    month = models.CharField(max_length=7)  # YYYY-MM
    
    onboarding_count = models.PositiveIntegerField(default=0)
    activity_bonus = models.PositiveIntegerField(default=0)
    streak_bonus = models.PositiveIntegerField(default=0)
    total_points = models.PositiveIntegerField(default=0)
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_bonus", limit_choices_to={'role': 'SUB_ADMIN'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'month', 'company']
        ordering = ['-month']
    
    def __str__(self):
        return f"{self.user.email} - {self.month} - {self.total_points} points"
    
    
#==========================================================
class PointsLog(models.Model):
    """Track every point change - daily, weekly, monthly"""
    class Reason(models.TextChoices):
        CHECKIN_ON_TIME = "CHECKIN_ON_TIME", "Check-in On Time"
        CHECKIN_LATE = "CHECKIN_LATE", "Check-in Late"
        ABSENT = "ABSENT", "Absent"
        WORK_REPORT = "WORK_REPORT", "Work Report Submitted"
        GREEN_PERFORMANCE = "GREEN_PERFORMANCE", "Both Targets Met"
        ORANGE_PERFORMANCE = "ORANGE_PERFORMANCE", "One Target Met"
        RED_PERFORMANCE = "RED_PERFORMANCE", "No Target Met"
        STREAK_BONUS = "STREAK_BONUS", "Streak Bonus"
        STREAK_BROKEN = "STREAK_BROKEN", "Streak Broken"
        WEEKLY_SUBMISSIONS = "WEEKLY_SUBMISSIONS", "Weekly Submissions Bonus"
        WEEKLY_INTERVIEWS = "WEEKLY_INTERVIEWS", "Weekly Interviews Bonus"
        PIPELINE_BONUS = "PIPELINE_BONUS", "Active Pipeline Bonus"
        ONBOARDING = "ONBOARDING", "Candidate Onboarding"
        MULTIPLE_ONBOARDING = "MULTIPLE_ONBOARDING", "Multiple Onboarding Bonus"
        LEAVE_UNPAID = "LEAVE_UNPAID", "Unpaid Leave Deduction"
        MANUAL_ADJUSTMENT = "MANUAL_ADJUSTMENT", "Manual Adjustment"
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="points_logs")
    date = models.DateField(default=timezone.now)
    reason = models.CharField(max_length=50, choices=Reason.choices)
    points = models.IntegerField()  # positive or negative
    running_total = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_points_logs", limit_choices_to={'role': 'SUB_ADMIN'})
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['company', 'user', 'date']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.date} - {self.reason} - {self.points}"


class WeeklyBonus(models.Model):
    """Track weekly bonuses given - prevent duplicate"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="weekly_bonuses")
    week_start = models.DateField()  # Monday of the week
    week_end = models.DateField()    # Sunday of the week
    
    submissions_bonus = models.PositiveIntegerField(default=0)
    interviews_bonus = models.PositiveIntegerField(default=0)
    pipeline_bonus = models.PositiveIntegerField(default=0)
    total_bonus = models.PositiveIntegerField(default=0)
    
    submissions_count = models.PositiveIntegerField(default=0)  # Actual count achieved
    interviews_count = models.PositiveIntegerField(default=0)   # Actual count achieved
    pipeline_count = models.PositiveIntegerField(default=0)     # Actual count achieved
    
    company = models.ForeignKey(User, on_delete=models.CASCADE, related_name="company_weekly_bonuses", limit_choices_to={'role': 'SUB_ADMIN'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'week_start']
        ordering = ['-week_start']
    
    def __str__(self):
        return f"{self.user.email} - Week {self.week_start} - {self.total_bonus} points"


class PointsCalculator:
    """Helper class to calculate points based on company settings"""
    
    def __init__(self, company):
        self.company = company
        self.settings = CompanySettings.objects.get(company=company)
    
    def get_checkin_points(self, is_on_time):
        return self.settings.points_on_time if is_on_time else self.settings.points_late
    
    def get_performance_points(self, color):
        if color == "GREEN":
            return self.settings.points_green
        elif color == "ORANGE":
            return self.settings.points_orange
        return self.settings.points_red
    
    def get_streak_bonus(self, streak):
        """Return bonus points based on streak thresholds"""
        thresholds = self.settings.streak_bonus_thresholds
        bonuses = self.settings.streak_bonus_points
        
        for i, threshold in enumerate(thresholds):
            if streak >= threshold:
                return bonuses[i] if i < len(bonuses) else 0
        return 0
    
    def get_absent_points(self):
        return self.settings.points_absent
    
    def get_no_report_points(self):
        return self.settings.points_no_report
    
    def get_onboarding_points(self, count_in_month):
        if count_in_month >= 3:
            return self.settings.points_multiple_onboarding
        return self.settings.points_onboarding
    
    def get_weekly_submission_points(self, count):
        if count >= 5:
            return self.settings.points_weekly_submission
        return 0
    
    def get_weekly_interview_points(self, count):
        if count >= 3:
            return self.settings.points_weekly_interview
        return 0
    
    def get_pipeline_points(self, count):
        if count >= 5:
            return self.settings.points_pipeline
        return 0
    
    def get_streak_broken_points(self):
        return self.settings.points_streak_broken
    
    def get_unpaid_leave_points_per_day(self):
        return self.settings.points_leave_unpaid