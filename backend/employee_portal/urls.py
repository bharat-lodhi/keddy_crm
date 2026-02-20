from django.urls import path
from . import views
app_name = 'employee_portal'

urlpatterns = [
    #=================================Venders===============================
    path("api/vendors/create/",views.VendorCreateAPIView.as_view(),name="vendor-create"),
    path("api/vendors/<int:vendor_id>/update/",views.VendorUpdateAPIView.as_view(),name="vendor-update"),
    path("api/vendors/",views.VendorFullListAPIView.as_view(),name="vendor-list"),
    path("api/vendors/<int:vendor_id>/",views.VendorDetailAPIView.as_view(),name="vendor-detail"),
    path("api/vendors/<int:vendor_id>/delete/",views.VendorDeleteAPIView.as_view(),name="vendor-delete"),
    
    path("api/user/vendors/",views.UserVendorFullListAPIView.as_view(),name="user-vendor-list"),
    #===============================Client========================================
    path('clients/create/', views.ClientCreateAPIView.as_view(), name='client-create'),
    path('clients/list/', views.ClientListAPIView.as_view(), name='client-list'),   
    #=============================================================================

    path("api/employees/", views.EmployeeDropdownAPIView.as_view(), name="employee-dropdown"),
    
    #============================Add Candidate======================================
    path('api/candidates/parse-resume/', views.ResumeParseAPIView.as_view(), name='parse-resume'),
    path("api/candidates/create/", views.CandidateCreateAPIView.as_view(), name="candidate-create"),
    path("api/candidates/list/", views.CandidateListAPIView.as_view(), name="candidate-list"),   #All User
    
    path("api/user/candidates/list/", views.UserCandidateListAPIView.as_view(), name="user-candidate-list"),   # User Based
    path("candidates/<int:pk>/update/", views.CandidateUpdateAPIView.as_view(), name="candidate-update"),
    path("api/candidates/<int:pk>/", views.CandidateDetailAPIView.as_view(), name="candidate-detail"),
    path("api/submitted-profiles/",views.SubmittedProfilesView.as_view(),name="submitted-profiles",),
    
    #========================DashBoard==================================================
    path("dashboard/stats/", views.dashboard_stats, name="dashboard-stats"),
    path("dashboard/today-candidates/", views.today_user_candidates, name="today-candidates"),
    path("dashboard/today-verified-candidates/", views.today_verified_candidates, name="today-verified-candidates"),
    path("dashboard/active-pipeline-candidates/", views.active_pipeline_candidates, name="active-pipeline-candidates"),
    path("dashboard/team/today-submissions/", views.today_team_submissions),
    path("team/all-submissions/", views.all_team_submissions),

]