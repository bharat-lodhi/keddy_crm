from rest_framework import serializers
from django.utils import timezone
from .models import (
    Attendance, DailyWorkReport, DailyTarget, PerformanceTracker,
    PointsLog, CompanySettings, Leave, Holiday
)
from django.contrib.auth import get_user_model
from django.conf import settings
import pytz

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'profile_picture']


class AttendanceSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    work_from_display = serializers.CharField(source='get_work_from_display', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'date', 'check_in', 'check_out', 'status', 'status_display',
            'work_from', 'work_from_display', 'late_reason', 'location'
        ]
        read_only_fields = ['status', 'date']


class CheckInSerializer(serializers.Serializer):
    work_from = serializers.ChoiceField(choices=Attendance.WorkFrom.choices, default=Attendance.WorkFrom.OFFICE)
    location = serializers.CharField(required=False, allow_blank=True)
    late_reason = serializers.CharField(required=False, allow_blank=True)


class CheckOutSerializer(serializers.Serializer):
    pass  # No fields needed


class DailyWorkReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyWorkReport
        fields = ['id', 'date', 'work_done', 'challenges', 'plan_for_tomorrow']
        read_only_fields = ['date']


class PerformanceTrackerSerializer(serializers.ModelSerializer):
    color_code = serializers.CharField(read_only=True)
    performance_percentage = serializers.FloatField(read_only=True)
    is_top_performer = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PerformanceTracker
        fields = [
            'id', 'date', 'sourced_today', 'submitted_today',
            'monthly_sourced', 'monthly_submitted', 'total_sourced', 'total_submitted',
            'color_code', 'performance_percentage', 'is_top_performer'
        ]


class DailyTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTarget
        fields = ['id', 'date', 'target_sourcing', 'target_submission']


class PointsLogSerializer(serializers.ModelSerializer):
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    
    class Meta:
        model = PointsLog
        fields = ['id', 'date', 'reason', 'reason_display', 'points', 'running_total', 'description', 'created_at']


class MyTodayResponseSerializer(serializers.Serializer):
    attendance = AttendanceSerializer()
    report = DailyWorkReportSerializer(allow_null=True)
    performance = PerformanceTrackerSerializer()
    target = DailyTargetSerializer(allow_null=True)
    suggestions = serializers.DictField()


class MyMonthlyResponseSerializer(serializers.Serializer):
    month = serializers.CharField()
    attendance_summary = serializers.DictField()
    performance_summary = serializers.DictField()
    points_summary = serializers.DictField()
    daily_data = serializers.ListField()

class AttendanceBoardSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer()
    check_in_time = serializers.SerializerMethodField()
    check_out_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = ['id', 'user', 'check_in', 'check_in_time','check_out','check_out_time', 'work_from', 'location']
    
    def get_check_in_time(self, obj):
        if obj.check_in:
            # Agar timezone aware hai to local me convert
            local_tz = pytz.timezone(settings.TIME_ZONE)
            local_time = obj.check_in.astimezone(local_tz)
            return local_time.strftime("%I:%M %p")
        return None
    
    def get_check_out_time(self, obj):
        if obj.check_out:
            # Agar timezone aware hai to local me convert
            local_tz = pytz.timezone(settings.TIME_ZONE)
            local_time = obj.check_out.astimezone(local_tz)
            return local_time.strftime("%I:%M %p")
        return None
    

#=============================User Management==========================================

class EmployeeListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    total_points = serializers.IntegerField(read_only=True)
    attendance_streak = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'number', 'role', 
                  'profile_picture', 'is_active', 'total_points', 'attendance_streak', 
                  'last_attendance_date', 'date_joined']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
# ====================================================================================

# ======================Attendance Management===============================
from django.utils import timezone
import pytz

class AdminAttendanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['check_in', 'check_out', 'status', 'work_from', 'late_reason', 'location']
    
    def validate_check_in(self, value):
        if value and value > timezone.now():
            raise serializers.ValidationError("Check-in time cannot be in future")
        return value
    
    def validate_check_out(self, value):
        if value and self.initial_data.get('check_in'):
            check_in = self.initial_data.get('check_in')
            if isinstance(check_in, str):
                from dateutil import parser
                check_in = parser.parse(check_in)
                # Make check_in timezone-aware if it's naive
                if timezone.is_naive(check_in):
                    check_in = timezone.make_aware(check_in, pytz.timezone(settings.TIME_ZONE))
            
            # Make value timezone-aware if it's naive
            if timezone.is_naive(value):
                value = timezone.make_aware(value, pytz.timezone(settings.TIME_ZONE))
            
            if value <= check_in:
                raise serializers.ValidationError("Check-out must be after check-in")
        return value


# =====================Daily admin respot====================
# class AdminReportListSerializer(serializers.ModelSerializer):
#     user_name = serializers.SerializerMethodField()
#     user_email = serializers.SerializerMethodField()
    
#     class Meta:
#         model = DailyWorkReport
#         fields = ['id', 'user', 'user_name', 'user_email', 'date', 'work_done', 
#                   'challenges', 'plan_for_tomorrow', 'created_at', 'updated_at']
    
#     def get_user_name(self, obj):
#         return f"{obj.user.first_name} {obj.user.last_name}".strip()
    
#     def get_user_email(self, obj):
#         return obj.user.email


class AdminReportListSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    check_in_time = serializers.SerializerMethodField()
    check_out_time = serializers.SerializerMethodField()
    
    class Meta:
        model = DailyWorkReport
        fields = [
            'id', 'user', 'user_name', 'user_email', 'date', 
            'work_done', 'challenges', 'plan_for_tomorrow',
            'check_in_time', 'check_out_time',
            'created_at', 'updated_at'
        ]
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()
    
    def get_user_email(self, obj):
        return obj.user.email
    
    def get_check_in_time(self, obj):
        """Get check-in time for this user on this date"""
        try:
            attendance = Attendance.objects.get(user=obj.user, date=obj.date)
            if attendance.check_in:
                local_tz = pytz.timezone(settings.TIME_ZONE)
                local_time = attendance.check_in.astimezone(local_tz)
                return local_time.strftime("%I:%M %p")
        except Attendance.DoesNotExist:
            pass
        return None
    
    def get_check_out_time(self, obj):
        """Get check-out time for this user on this date"""
        try:
            attendance = Attendance.objects.get(user=obj.user, date=obj.date)
            if attendance.check_out:
                local_tz = pytz.timezone(settings.TIME_ZONE)
                local_time = attendance.check_out.astimezone(local_tz)
                return local_time.strftime("%I:%M %p")
        except Attendance.DoesNotExist:
            pass
        return None