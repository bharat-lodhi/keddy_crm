from django.urls import path
from . import views

app_name = 'attendance_tracker'

urlpatterns = [
    # Employee APIs
    path('check-in/', views.CheckInAPIView.as_view(), name='check-in'),
    path('check-out/', views.CheckOutAPIView.as_view(), name='check-out'),
    path('daily-report/', views.DailyReportAPIView.as_view(), name='daily-report'),
    path('my-today/', views.MyTodayAPIView.as_view(), name='my-today'),
    path('my-monthly/', views.MyMonthlyAPIView.as_view(), name='my-monthly'),
    path('attendance-board/', views.AttendanceBoardAPIView.as_view(), name='attendance-board'),
    
    # ======================Sub-Admin==============================================
    #user-management
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:id>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    
    # Sub-Admin - Attendance Management
    path('admin/attendance/', views.AdminAttendanceListView.as_view(), name='admin-attendance'),
    path('admin/attendance/<int:id>/', views.AdminAttendanceUpdateView.as_view(), name='admin-attendance-update'),
    path('admin/attendance/<int:id>/delete/', views.AdminAttendanceDeleteView.as_view(), name='admin-attendance-delete'),

    # Sub-Admin - Daily Reports Management
    path('admin/reports/', views.AdminReportListView.as_view(), name='admin-reports'),
    path('admin/reports/<int:id>/delete/', views.AdminReportDeleteView.as_view(), name='admin-report-delete'),
    
]
