from django.urls import path
from . import views
app_name = 'employee_portal'

urlpatterns = [
    #=================================Venders===============================
    path("api/vendors/create/",views.VendorCreateAPIView.as_view(),name="vendor-create"),  #U
    path("api/vendors/<int:vendor_id>/update/",views.VendorUpdateAPIView.as_view(),name="vendor-update"), #U
    path("api/comapany/vendors/pool/",views.VendorCompanyPoolAPIView.as_view(),name="vendor-list-pool"),  #U
    path("api/vendors/<int:vendor_id>/",views.VendorDetailAPIView.as_view(),name="vendor-detail"),  #U
    path("api/vendors/<int:vendor_id>/delete/",views.VendorSoftDeleteAPIView.as_view(),name="vendor-delete"), #U
    path("api/user/vendors/",views.UserVendorFullListAPIView.as_view(),name="user-vendor-list"),  #U
    #===============================Client========================================
    path('clients/create/', views.ClientCreateAPIView.as_view(), name='client-create'),  #U
    path("api/clients/<int:client_id>/update/",views.ClientUpdateAPIView.as_view(),name="client-update"),  # U N
    path('clients/list/', views.ClientListAPIView.as_view(), name='client-list'),   #U
    path("api/clients/<int:client_id>/",views.ClientDetailAPIView.as_view(),name="client-detail"),  #U N
    path("api/clients/<int:client_id>/delete/",views.ClientSoftDeleteAPIView.as_view(),name="client-soft-delete"), #U N
    #=============================================================================

    path("api/employees/", views.EmployeeDropdownAPIView.as_view(), name="employee-dropdown"),  #U

    #============================Add Candidate======================================
    path('api/candidates/parse-resume/', views.ResumeParseAPIView.as_view(), name='parse-resume'),
    path("api/candidates/create/", views.CandidateCreateAPIView.as_view(), name="candidate-create"),  #U (but-update api me nhi likha same h working)
    path("api/candidates/list/", views.CandidateListAPIView.as_view(), name="candidate-list"), #U   #All User
    
    path("api/user/candidates/list/", views.UserCandidateListAPIView.as_view(), name="user-candidate-list"), # U   # User Based
    path("candidates/<int:pk>/update/", views.CandidateUpdateAPIView.as_view(), name="candidate-update"),  #U
    path("api/candidates/<int:pk>/", views.CandidateDetailAPIView.as_view(), name="candidate-detail"), #U
    path("api/submitted-profiles/",views.SubmittedProfilesView.as_view(),name="submitted-profiles",),  #U
    path("api/candidates/<int:pk>/soft-delete/", views.CandidateSoftDeleteAPIView.as_view()), #U N
    
    #========================DashBoard==================================================
    path("dashboard/stats/", views.dashboard_stats, name="dashboard-stats"),   #U
    path("dashboard/today-candidates/", views.today_user_candidates, name="today-candidates"),  #U
    path("dashboard/today-verified-candidates/", views.today_verified_candidates, name="today-verified-candidates"),  #U
    path("dashboard/active-pipeline-candidates/", views.active_pipeline_candidates, name="active-pipeline-candidates"), #U
    path("dashboard/team/today-submissions/", views.today_team_submissions),  #U
    
    path("dashboard/last-7-days-verified/",views.last_7_days_verified_candidates,name="last_7_days_verified_candidates",),  #U N
    # ------
    path("team/all-submissions/", views.all_team_submissions),  #U

]
