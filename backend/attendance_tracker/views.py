from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q, Sum, Count
from datetime import datetime, timedelta
from django.core.paginator import Paginator
from django.contrib.auth import get_user_model, login
from django.conf import settings
import pytz
from employee_portal.models import Vendor,Client,Candidate
from jd_mapping.models import CandidateJDSubmission,RequirementAssignment

from .models import (
    Attendance, DailyWorkReport, PerformanceTracker, DailyTarget, 
    PointsLog, CompanySettings, Holiday, Leave
)
from .serializers import (
    AttendanceSerializer, CheckInSerializer, CheckOutSerializer,
    DailyWorkReportSerializer, PerformanceTrackerSerializer,
    MyTodayResponseSerializer, MyMonthlyResponseSerializer,
    AttendanceBoardSerializer, UserBasicSerializer,DailyTargetSerializer
)
from .permissions import IsEmployee, IsSubAdmin, IsCompanyUser
from .utils import (
    get_company, get_company_settings, get_daily_target,
    calculate_performance_percentage, get_color_code,
    get_smart_suggestions, add_points_log
)

User = get_user_model()


# ==================== EMPLOYEE APIS ====================

class CheckInAPIView(APIView):
    """POST /attendance/check-in/ - No body required"""
    permission_classes = [IsAuthenticated, IsEmployee]
    
    def post(self, request):
        user = request.user
        company = get_company(user)
        today = timezone.now().date()
        
        # Check if already checked in today
        attendance, created = Attendance.objects.get_or_create(
            user=user, date=today,
            defaults={'company': company}
        )
        
        if attendance.check_in:
            return Response(
                {'error': 'Already checked in today'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Auto capture check-in time
        check_in_time = timezone.now()
        attendance.check_in = check_in_time
        
        # Default work_from = OFFICE
        attendance.work_from = Attendance.WorkFrom.OFFICE
        
        # Location optional - leave blank if not required
        company_settings = get_company_settings(company)  # Changed from 'settings' to 'company_settings'
        if company_settings.require_location:
            # If admin requires location, employee must send it
            location = request.data.get('location')
            if not location:
                return Response(
                    {'error': 'Location is required by admin'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            attendance.location = location
        
        # Auto calculate status based on company office time
        attendance.status = Attendance.calculate_status(check_in_time, company)
        
        attendance.save()
        
        # Update user streak and points
        if attendance.status == Attendance.Status.ON_TIME:
            if user.last_attendance_date == today - timedelta(days=1):
                user.attendance_streak += 1
            else:
                user.attendance_streak = 1
            add_points_log(user, PointsLog.Reason.CHECKIN_ON_TIME, company_settings.points_on_time)  # Changed
        else:
            user.late_warning_count += 1
            add_points_log(user, PointsLog.Reason.CHECKIN_LATE, company_settings.points_late)  # Changed
            
        
        user.last_attendance_date = today
        user.save()
        
        local_tz = pytz.timezone(settings.TIME_ZONE)  # This uses django.settings, correct
        check_in_local = check_in_time.astimezone(local_tz)
        
        return Response({
            'message': 'Check-in successful',
            'status': attendance.status,
            'streak': user.attendance_streak,
            'check_in': check_in_local.strftime("%I:%M %p")  # Changed to use local time
        }, status=status.HTTP_200_OK)
        

# class CheckOutAPIView(APIView):
#     """POST /attendance/check-out/"""
#     permission_classes = [IsAuthenticated, IsEmployee]
    
#     def post(self, request):
#         user = request.user
#         today = timezone.now().date()
        
#         try:
#             attendance = Attendance.objects.get(user=user, date=today)
#         except Attendance.DoesNotExist:
#             return Response(
#                 {'error': 'No check-in found for today'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         if attendance.check_out:
#             return Response(
#                 {'error': 'Already checked out'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         attendance.check_out = timezone.now()
#         attendance.save()
        
#         return Response({
#             'message': 'Check-out successful',
#             'check_out': attendance.check_out.strftime("%I:%M %p"),
#             'total_hours': (attendance.check_out - attendance.check_in).total_seconds() / 3600
#         }, status=status.HTTP_200_OK)


from django.utils import timezone
import pytz

class CheckOutAPIView(APIView):
    """POST /attendance/check-out/"""
    permission_classes = [IsAuthenticated, IsEmployee]
    
    def post(self, request):
        user = request.user
        today = timezone.now().date()
        
        try:
            attendance = Attendance.objects.get(user=user, date=today)
        except Attendance.DoesNotExist:
            return Response(
                {'error': 'No check-in found for today'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if attendance.check_out:
            return Response(
                {'error': 'Already checked out'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get current time in local timezone
        local_tz = pytz.timezone(settings.TIME_ZONE)
        check_out_utc = timezone.now()
        check_out_local = check_out_utc.astimezone(local_tz)
        
        attendance.check_out = check_out_utc
        attendance.save()
        
        # Calculate hours in local time
        check_in_local = attendance.check_in.astimezone(local_tz)
        total_hours = (check_out_local - check_in_local).total_seconds() / 3600
        
        return Response({
            'message': 'Check-out successful',
            'check_out': check_out_local.strftime("%I:%M %p"),
            'total_hours': round(total_hours, 2)
        }, status=status.HTTP_200_OK)
        

class DailyReportAPIView(APIView):
    """POST /attendance/daily-report/"""
    permission_classes = [IsAuthenticated, IsEmployee]
    
    def post(self, request):
        user = request.user
        company = get_company(user)
        today = timezone.now().date()
        
        # Check if already reported
        if DailyWorkReport.objects.filter(user=user, date=today).exists():
            return Response({
                'success': False,
                'message': 'Daily report already submitted for today'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = DailyWorkReportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(user=user, date=today, company=company)
        
        # Add points for submitting report
        settings = get_company_settings(company)
        add_points_log(user, PointsLog.Reason.WORK_REPORT, settings.points_no_report)
        
        return Response({
            'success': True,
            'message': 'Daily report submitted successfully'
        }, status=status.HTTP_201_CREATED)


class MyTodayAPIView(APIView):
    """GET /attendance/my-today/"""
    permission_classes = [IsAuthenticated, IsEmployee]
    
    def get(self, request):
        user = request.user
        company = get_company(user)
        today = timezone.now().date()
        
        # Get attendance
        attendance = Attendance.objects.filter(user=user, date=today).first()
        
        # Get report
        report = DailyWorkReport.objects.filter(user=user, date=today).first()
        
        # Get or create performance tracker
        performance, created = PerformanceTracker.objects.get_or_create(
            user=user, date=today,
            defaults={'company': company}
        )
        
        # Get target
        target = get_daily_target(user, today)
        
        # Get suggestions
        suggestions = get_smart_suggestions(
            user, today, target,
            performance.sourced_today,
            performance.submitted_today,
            PerformanceTracker.objects.filter(company=company, date=today)
        )
        
        # Prepare response
        data = {
            'attendance': AttendanceSerializer(attendance).data if attendance else None,
            'report': DailyWorkReportSerializer(report).data if report else None,
            'performance': PerformanceTrackerSerializer(performance).data,
            'target': target if isinstance(target, dict) else DailyTargetSerializer(target).data,
            'suggestions': suggestions
        }
        
        return Response(data)

class MyMonthlyAPIView(APIView):
    """GET /attendance/my-monthly/?month=2026-03"""
    permission_classes = [IsAuthenticated, IsEmployee]
    
    def get(self, request):
        user = request.user
        month = request.query_params.get('month', timezone.now().strftime("%Y-%m"))
        year, month_num = map(int, month.split('-'))
        
        # Get all attendance for month
        attendances = Attendance.objects.filter(
            user=user,
            date__year=year,
            date__month=month_num
        )
        
        # Get all reports for month
        reports = DailyWorkReport.objects.filter(
            user=user,
            date__year=year,
            date__month=month_num
        )
        
        # Get all performance for month
        performances = PerformanceTracker.objects.filter(
            user=user,
            date__year=year,
            date__month=month_num
        )
        
        # Get points for month
        points = PointsLog.objects.filter(
            user=user,
            date__year=year,
            date__month=month_num
        )
        
        # Calculate attendance summary
        attendance_summary = {
            'total_days': attendances.count(),
            'on_time': attendances.filter(status=Attendance.Status.ON_TIME).count(),
            'late': attendances.filter(status=Attendance.Status.LATE).count(),
            'absent': attendances.filter(status=Attendance.Status.ABSENT).count(),
        }
        
        # Calculate performance summary manually (since performance_percentage is property)
        total_sourced = 0
        total_submitted = 0
        total_percentage = 0
        performance_count = performances.count()
        
        for perf in performances:
            total_sourced += perf.sourced_today
            total_submitted += perf.submitted_today
            total_percentage += perf.performance_percentage  # property works here
        
        performance_summary = {
            'total_sourced': total_sourced,
            'total_submitted': total_submitted,
            'avg_performance': round(total_percentage / performance_count, 2) if performance_count > 0 else 0,
        }
        
        # Points summary
        total_points = 0
        positive_points = 0
        negative_points = 0
        
        for p in points:
            total_points += p.points
            if p.points > 0:
                positive_points += p.points
            else:
                negative_points += p.points
        
        points_summary = {
            'total_points': total_points,
            'positive_points': positive_points,
            'negative_points': negative_points,
        }
        
        # Daily data with pagination
        daily_data = []
        for day in range(1, 32):
            daily = {
                'date': f"{year}-{month_num:02d}-{day:02d}",
                'attendance': None,
                'report': None,
                'performance': None
            }
            
            att = attendances.filter(date__day=day).first()
            if att:
                daily['attendance'] = {
                    'check_in': att.check_in.strftime("%I:%M %p") if att.check_in else None,
                    'check_out': att.check_out.strftime("%I:%M %p") if att.check_out else None,
                    'status': att.status
                }
            
            rep = reports.filter(date__day=day).first()
            if rep:
                daily['report'] = {
                    'work_done': rep.work_done,
                    'challenges': rep.challenges,
                    'plan_for_tomorrow': rep.plan_for_tomorrow
                }
            
            perf = performances.filter(date__day=day).first()
            if perf:
                daily['performance'] = {
                    'sourced_today': perf.sourced_today,
                    'submitted_today': perf.submitted_today,
                    'color_code': perf.color_code,
                    'performance_percentage': perf.performance_percentage
                }
            
            if daily['attendance'] or daily['report'] or daily['performance']:
                daily_data.append(daily)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 31))
        paginator = Paginator(daily_data, page_size)
        current_page = paginator.get_page(page)
        
        return Response({
            'success': True,
            'data': {
                'month': month,
                'attendance_summary': attendance_summary,
                'performance_summary': performance_summary,
                'points_summary': points_summary,
                'daily_data': current_page.object_list,
                'pagination': {
                    'total_pages': paginator.num_pages,
                    'current_page': page,
                    'total_items': paginator.count,
                    'has_next': current_page.has_next(),
                    'has_previous': current_page.has_previous()
                }
            }
        })


class AttendanceBoardAPIView(APIView):
    """GET /attendance/attendance-board/?page=1&page_size=20"""
    permission_classes = [IsAuthenticated, IsCompanyUser]
    
    def get(self, request):
        user = request.user
        company = get_company(user)
        today = timezone.now().date()
        
        # Get today's attendance for company (only on-time and late, absent hidden)
        attendances = Attendance.objects.filter(
            company=company,
            date=today,
            status__in=[Attendance.Status.ON_TIME, Attendance.Status.LATE]
        ).select_related('user')
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        paginator = Paginator(attendances, page_size)
        current_page = paginator.get_page(page)
        
        # Serialize
        serializer = AttendanceBoardSerializer(current_page.object_list, many=True)
        
        return Response({
            'date': today,
            'total_on_time': attendances.filter(status=Attendance.Status.ON_TIME).count(),
            'total_late': attendances.filter(status=Attendance.Status.LATE).count(),
            'users': serializer.data,
            'pagination': {
                'total_pages': paginator.num_pages,
                'current_page': page,
                'total_items': paginator.count,
                'has_next': current_page.has_next(),
                'has_previous': current_page.has_previous()
            }
        })
        

# ================================User-Management==================================================================

# Add these imports at top if not present
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from .serializers import EmployeeListSerializer

# ==================== SUB-ADMIN APIS ====================
# ==================== USER MANAGEMENT ====================

class AdminUserListView(APIView):
    """GET /attendance/admin/users/ - Get all employees of company"""
    permission_classes = [IsAuthenticated, IsSubAdmin]
    
    def get(self, request):
        company = request.user  # Sub-Admin is the company
        users = User.objects.filter(
            parent_user=company,
            role='EMPLOYEE'
        ).exclude(id=company.id)
        
        # Filters
        search = request.query_params.get('search', '')
        role = request.query_params.get('role', '')
        is_active = request.query_params.get('is_active', '')
        from_date = request.query_params.get('from_date', '')
        to_date = request.query_params.get('to_date', '')
        
        if search:
            users = users.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(number__icontains=search)
            )
        
        if role:
            users = users.filter(role=role)
        
        if is_active:
            users = users.filter(is_active=is_active.lower() == 'true')
        
        if from_date:
            users = users.filter(date_joined__date__gte=from_date)
        
        if to_date:
            users = users.filter(date_joined__date__lte=to_date)
        
        # Order by
        ordering = request.query_params.get('ordering', '-date_joined')
        users = users.order_by(ordering)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        paginator = Paginator(users, page_size)
        
        # Check if page is valid
        if page > paginator.num_pages:
            return Response({
                'success': True,
                'data': {
                    'users': [],
                    'pagination': {
                        'total_pages': paginator.num_pages,
                        'current_page': page,
                        'total_items': paginator.count,
                        'page_size': page_size,
                        'has_next': False,
                        'has_previous': page > 1
                    }
                }
            })
        
        current_page = paginator.get_page(page)
        serializer = EmployeeListSerializer(current_page.object_list, many=True)
        
        return Response({
            'success': True,
            'data': {
                'users': serializer.data,
                'pagination': {
                    'total_pages': paginator.num_pages,
                    'current_page': page,
                    'total_items': paginator.count,
                    'page_size': page_size,
                    'has_next': current_page.has_next(),
                    'has_previous': current_page.has_previous()
                }
            }
        })



class AdminUserDetailView(APIView):
    """GET /attendance/admin/users/<id>/ - Get complete employee details"""
    permission_classes = [IsAuthenticated, IsSubAdmin]
    
    def format_time(self, dt):
        if dt:
            local_tz = pytz.timezone(settings.TIME_ZONE)
            local_time = dt.astimezone(local_tz)
            return local_time.strftime("%I:%M %p")
        return None
    
    def get(self, request, id):
        company = request.user
        
        try:
            user = User.objects.get(
                id=id,
                parent_user=company,
                role='EMPLOYEE'
            )
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Employee not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Basic user info
        user_serializer = EmployeeListSerializer(user)
        
        # Today's data
        today = timezone.now().date()
        attendance_today = Attendance.objects.filter(user=user, date=today).first()
        report_today = DailyWorkReport.objects.filter(user=user, date=today).first()
        
        # Performance data
        performance_today = PerformanceTracker.objects.filter(user=user, date=today).first()
        performance_monthly = PerformanceTracker.objects.filter(
            user=user,
            month=today.strftime("%Y-%m")
        ).aggregate(
            total_sourced=Sum('sourced_today'),
            total_submitted=Sum('submitted_today')
        )
        
        # Target data
        target_today = get_daily_target(user, today)
        
        # Vendor & Client data
        total_vendors = Vendor.objects.filter(
            Q(created_by=user) | Q(assigned_employees=user),
            is_deleted=False
        ).distinct().count()
        
        total_clients = Client.objects.filter(
            Q(created_by=user) | Q(assigned_employees=user),
            is_deleted=False
        ).distinct().count()
        
        # Candidates data
        total_candidates = Candidate.objects.filter(
            created_by=user,
            is_deleted=False
        ).count()
        
        candidates_submitted = CandidateJDSubmission.objects.filter(
            submitted_by=user,
            is_active=True
        ).count()
        
        # Pipeline candidates (candidates not yet submitted)
        candidates_in_pipeline = Candidate.objects.filter(
            created_by=user,
            is_deleted=False,
            jd_submissions__isnull=True
        ).distinct().count()
        
        # Interviews today
        interviews_today = Candidate.objects.filter(
            created_by=user,
            scheduled_datetime__date=today,
            is_deleted=False
        ).count()
        
        # Leaves data
        leaves_pending = Leave.objects.filter(
            user=user,
            status=Leave.Status.PENDING
        ).count()
        
        leaves_approved = Leave.objects.filter(
            user=user,
            status=Leave.Status.APPROVED
        ).count()
        
        # Points data
        points_this_month = PointsLog.objects.filter(
            user=user,
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Sum('points'))['total'] or 0
        
        # Assigned requirements (JDs)
        assigned_requirements = RequirementAssignment.objects.filter(
            assigned_to=user
        ).count()
        
        # Submitted candidates to JD
        submitted_jds = CandidateJDSubmission.objects.filter(
            submitted_by=user
        ).count()
        
        return Response({
            'success': True,
            'data': {
                'user': user_serializer.data,
                'today': {
                    'attendance': {
                        'checked_in': attendance_today.check_in is not None if attendance_today else False,
                        'checked_out': attendance_today.check_out is not None if attendance_today else False,
                        'status': attendance_today.status if attendance_today else None,
                        'check_in_time': self.format_time(attendance_today.check_in) if attendance_today and attendance_today.check_in else None,
                        'check_out_time': self.format_time(attendance_today.check_out) if attendance_today and attendance_today.check_out else None
                    },
                    'report_submitted': report_today is not None,
                    'performance': {
                        'sourced_today': performance_today.sourced_today if performance_today else 0,
                        'submitted_today': performance_today.submitted_today if performance_today else 0,
                        'color_code': performance_today.color_code if performance_today else 'RED',
                        'performance_percentage': performance_today.performance_percentage if performance_today else 0
                    },
                    'target': {
                        'target_sourcing': target_today.get('target_sourcing', 5) if isinstance(target_today, dict) else target_today.target_sourcing,
                        'target_submission': target_today.get('target_submission', 2) if isinstance(target_today, dict) else target_today.target_submission
                    }
                },
                'monthly_performance': {
                    'total_sourced': performance_monthly['total_sourced'] or 0,
                    'total_submitted': performance_monthly['total_submitted'] or 0
                },
                'overall_stats': {
                    'total_vendors_created': total_vendors,
                    'total_clients_created': total_clients,
                    'total_candidates_created': total_candidates,
                    'total_candidates_submitted': candidates_submitted,
                    'candidates_in_pipeline': candidates_in_pipeline,
                    'interviews_today': interviews_today,
                    'assigned_requirements': assigned_requirements,
                    'submitted_jds': submitted_jds
                },
                'leaves': {
                    'pending': leaves_pending,
                    'approved': leaves_approved
                },
                'points': {
                    'total_points': user.total_points,
                    'points_this_month': points_this_month,
                    'attendance_streak': user.attendance_streak,
                    'late_warning_count': user.late_warning_count
                }
            }
        })
        
# ====================================================================================

# Add these imports at top if not present
from dateutil import parser
from django.utils.dateparse import parse_date
from .serializers import AdminAttendanceUpdateSerializer, AttendanceBoardSerializer

# ==================== ATTENDANCE MANAGEMENT ====================

class AdminAttendanceListView(APIView):
    """GET /attendance/admin/attendance/ - View all attendance with filters"""
    permission_classes = [IsAuthenticated, IsSubAdmin]
    
    def format_time(self, dt):
        if dt:
            local_tz = pytz.timezone(settings.TIME_ZONE)
            local_time = dt.astimezone(local_tz)
            return local_time.strftime("%I:%M %p")
        return None
    
    def get(self, request):
        company = request.user
        
        # Filters
        user_id = request.query_params.get('user_id', '')
        date = request.query_params.get('date', '')
        month = request.query_params.get('month', '')
        from_date = request.query_params.get('from_date', '')
        to_date = request.query_params.get('to_date', '')
        status = request.query_params.get('status', '')
        
        # Base queryset - company employees attendance
        company_users = User.objects.filter(parent_user=company, role='EMPLOYEE')
        attendances = Attendance.objects.filter(user__in=company_users, company=company)
        
        # Apply filters
        if user_id:
            attendances = attendances.filter(user_id=user_id)
        
        if date:
            attendances = attendances.filter(date=date)
        
        if month:
            year, month_num = map(int, month.split('-'))
            attendances = attendances.filter(date__year=year, date__month=month_num)
        
        if from_date:
            attendances = attendances.filter(date__gte=from_date)
        
        if to_date:
            attendances = attendances.filter(date__lte=to_date)
        
        if status:
            attendances = attendances.filter(status=status)
        
        # Order by
        ordering = request.query_params.get('ordering', '-date')
        attendances = attendances.order_by(ordering)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        paginator = Paginator(attendances, page_size)
        
        # Check if page is valid
        if page > paginator.num_pages:
            return Response({
                'success': True,
                'data': {
                    'attendances': [],
                    'pagination': {
                        'total_pages': paginator.num_pages,
                        'current_page': page,
                        'total_items': paginator.count,
                        'page_size': page_size,
                        'has_next': False,
                        'has_previous': page > 1
                    }
                }
            })
        
        current_page = paginator.get_page(page)
        
        # Prepare response data
        attendance_data = []
        for att in current_page.object_list:
            attendance_data.append({
                'id': att.id,
                'user': {
                    'id': att.user.id,
                    'email': att.user.email,
                    'first_name': att.user.first_name,
                    'last_name': att.user.last_name,
                    'full_name': f"{att.user.first_name} {att.user.last_name}".strip()
                },
                'date': att.date,
                'check_in': att.check_in,
                'check_in_time': self.format_time(att.check_in),
                'check_out': att.check_out,
                'check_out_time': self.format_time(att.check_out),
                'status': att.status,
                'status_display': att.get_status_display(),
                'work_from': att.work_from,
                'late_reason': att.late_reason,
                'location': att.location
            })
        
        return Response({
            'success': True,
            'data': {
                'attendances': attendance_data,
                'pagination': {
                    'total_pages': paginator.num_pages,
                    'current_page': page,
                    'total_items': paginator.count,
                    'page_size': page_size,
                    'has_next': current_page.has_next(),
                    'has_previous': current_page.has_previous()
                }
            }
        })


class AdminAttendanceUpdateView(APIView):
    """GET /attendance/admin/attendance/<id>/ - Get single attendance
       PUT /attendance/admin/attendance/<id>/ - Edit attendance"""
    permission_classes = [IsAuthenticated, IsSubAdmin]
    
    def format_time_response(self, dt):
        if dt:
            local_tz = pytz.timezone(settings.TIME_ZONE)
            local_time = dt.astimezone(local_tz)
            return local_time.strftime("%I:%M %p")
        return None
    
    def get_attendance_data(self, attendance):
        return {
            'id': attendance.id,
            'user': {
                'id': attendance.user.id,
                'email': attendance.user.email,
                'first_name': attendance.user.first_name,
                'last_name': attendance.user.last_name,
                'full_name': f"{attendance.user.first_name} {attendance.user.last_name}".strip()
            },
            'date': attendance.date,
            'check_in': attendance.check_in,
            'check_in_time': self.format_time_response(attendance.check_in),
            'check_out': attendance.check_out,
            'check_out_time': self.format_time_response(attendance.check_out),
            'status': attendance.status,
            'status_display': attendance.get_status_display(),
            'work_from': attendance.work_from,
            'work_from_display': attendance.get_work_from_display(),
            'late_reason': attendance.late_reason,
            'location': attendance.location,
            'created_at': attendance.created_at,
            'updated_at': attendance.updated_at
        }
    
    def get(self, request, id):
        company = request.user
        
        try:
            attendance = Attendance.objects.get(id=id, company=company)
        except Attendance.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Attendance record not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': True,
            'data': self.get_attendance_data(attendance)
        })
    
    def put(self, request, id):
        company = request.user
        
        try:
            attendance = Attendance.objects.get(id=id, company=company)
        except Attendance.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Attendance record not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AdminAttendanceUpdateSerializer(attendance, data=request.data, partial=True)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse datetime strings if provided
        if 'check_in' in request.data and request.data['check_in']:
            check_in_str = request.data['check_in']
            if isinstance(check_in_str, str):
                check_in = parser.parse(check_in_str)
                if timezone.is_naive(check_in):
                    check_in = timezone.make_aware(check_in, pytz.timezone(settings.TIME_ZONE))
                attendance.check_in = check_in
                attendance.status = Attendance.calculate_status(attendance.check_in, company)
        
        if 'check_out' in request.data and request.data['check_out']:
            check_out_str = request.data['check_out']
            if isinstance(check_out_str, str):
                check_out = parser.parse(check_out_str)
                if timezone.is_naive(check_out):
                    check_out = timezone.make_aware(check_out, pytz.timezone(settings.TIME_ZONE))
                attendance.check_out = check_out
        
        # Update other fields
        if 'status' in request.data:
            attendance.status = request.data['status']
        
        if 'work_from' in request.data:
            attendance.work_from = request.data['work_from']
        
        if 'late_reason' in request.data:
            attendance.late_reason = request.data['late_reason']
        
        if 'location' in request.data:
            attendance.location = request.data['location']
        
        attendance.save()
        
        return Response({
            'success': True,
            'message': 'Attendance updated successfully',
            'data': self.get_attendance_data(attendance)
        })

class AdminAttendanceDeleteView(APIView):
    """DELETE /attendance/admin/attendance/<id>/delete/ - Delete attendance record"""
    permission_classes = [IsAuthenticated, IsSubAdmin]
    
    def delete(self, request, id):
        company = request.user
        
        try:
            attendance = Attendance.objects.get(id=id, company=company)
        except Attendance.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Attendance record not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Store info for response
        user_email = attendance.user.email
        attendance_date = attendance.date
        
        attendance.delete()
        
        return Response({
            'success': True,
            'message': f'Attendance record for {user_email} on {attendance_date} deleted successfully'
        })
        
# ==================== DAILY REPORTS MANAGEMENT ====================
from .serializers import AdminReportListSerializer


class AdminReportListView(APIView):
    """GET /attendance/admin/reports/ - View all daily reports with filters"""
    permission_classes = [IsAuthenticated, IsSubAdmin]
    
    def get(self, request):
        company = request.user
        
        # Filters
        user_id = request.query_params.get('user_id', '')
        date = request.query_params.get('date', '')
        from_date = request.query_params.get('from_date', '')
        to_date = request.query_params.get('to_date', '')
        search = request.query_params.get('search', '')
        
        # Base queryset - company employees reports
        company_users = User.objects.filter(parent_user=company, role='EMPLOYEE')
        reports = DailyWorkReport.objects.filter(user__in=company_users, company=company)
        
        # Apply filters
        if user_id:
            reports = reports.filter(user_id=user_id)
        
        if date:
            reports = reports.filter(date=date)
        
        if from_date:
            reports = reports.filter(date__gte=from_date)
        
        if to_date:
            reports = reports.filter(date__lte=to_date)
        
        if search:
            reports = reports.filter(
                Q(work_done__icontains=search) |
                Q(challenges__icontains=search) |
                Q(plan_for_tomorrow__icontains=search)
            )
        
        # Order by
        ordering = request.query_params.get('ordering', '-date')
        reports = reports.order_by(ordering)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        paginator = Paginator(reports, page_size)
        
        # Check if page is valid
        if page > paginator.num_pages:
            return Response({
                'success': True,
                'data': {
                    'reports': [],
                    'pagination': {
                        'total_pages': paginator.num_pages,
                        'current_page': page,
                        'total_items': paginator.count,
                        'page_size': page_size,
                        'has_next': False,
                        'has_previous': page > 1
                    }
                }
            })
        
        current_page = paginator.get_page(page)
        serializer = AdminReportListSerializer(current_page.object_list, many=True)
        
        return Response({
            'success': True,
            'data': {
                'reports': serializer.data,
                'pagination': {
                    'total_pages': paginator.num_pages,
                    'current_page': page,
                    'total_items': paginator.count,
                    'page_size': page_size,
                    'has_next': current_page.has_next(),
                    'has_previous': current_page.has_previous()
                }
            }
        })


class AdminReportDeleteView(APIView):
    """DELETE /attendance/admin/reports/<id>/delete/ - Delete daily report"""
    permission_classes = [IsAuthenticated, IsSubAdmin]
    
    def delete(self, request, id):
        company = request.user
        
        try:
            report = DailyWorkReport.objects.get(id=id, company=company)
        except DailyWorkReport.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Daily report not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Store info for response
        user_name = f"{report.user.first_name} {report.user.last_name}".strip()
        report_date = report.date
        
        report.delete()
        
        return Response({
            'success': True,
            'message': f'Daily report for {user_name} on {report_date} deleted successfully'
        })

# ======================================================================================