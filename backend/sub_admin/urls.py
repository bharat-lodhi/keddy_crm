from django.urls import path
from . import views
app_name = 'sub_admin'

urlpatterns = [
    # Sub-Admin Dashboard Stats (sabhi employees ka data)
    path("api/subadmin/dashboard/stats/", views.dashboard_stats, name="subadmin-dashboard-stats"),  #U

    # Today Verified Profiles (sabhi employees)
    path("api/subadmin/dashboard/today-verified/", views.today_verified_candidates, name="subadmin-today-verified"), #U

    # Pipeline Candidates (sabhi employees pipeline)
    path("api/subadmin/dashboard/pipeline/", views.active_pipeline_candidates, name="subadmin-pipeline"),  #U
    
    path("api/last-7-days-verified/",views.last_7_days_verified_candidates,name="last_7_days_verified_candidates",), #U N
    
    
    #=================User-management=================
    # LIST (employees only) + CREATE (any role)
    path("api/users/", views.SubAdminUserListCreateAPIView.as_view(), name="subadmin-users"),  #U
    path("api/users/<int:user_id>/soft-delete/", views.SubAdminUserSoftDeleteAPIView.as_view(), name="subadmin-user-soft-delete"),   #U
    path("api/users/<int:user_id>/hard-delete/", views.SubAdminUserHardDeleteAPIView.as_view(), name="subadmin-user-hard-delete"),   #U
    path("api/users/<int:user_id>/restore/", views.SubAdminUserRestoreAPIView.as_view(), name="subadmin-user-restore"),  #U
    # UPDATE (employee only)
    path("api/users/<int:pk>/", views.SubAdminUserUpdateAPIView.as_view(), name="subadmin-user-update"),  #U
    
    #=================All-profiles=============================
    path("api/admin-candidates/",views.AdminCandidateListAPIView.as_view(),name="admin-candidate-list",),
    # All Vendors
    path("api/admin-vendors/",views.AdminVendorFullListAPIView.as_view(),name="admin-vendor-list",), #U
    path("api/vendors/assign/",views.VendorAssignAPIView.as_view(),name="subadmin-vendor-assign"), #N U
    path("api/vendors/<int:vendor_id>/soft-delete/", views.AdminVendorSoftDeleteAPIView.as_view()), #N U
    path("api/vendors/<int:vendor_id>/restore/", views.AdminVendorRestoreAPIView.as_view()), #N U
    path("api/vendors/<int:vendor_id>/hard-delete/", views.AdminVendorHardDeleteAPIView.as_view()), #N U
    #  all Client list
    path("api/clients/",views.SubAdminClientListAPIView.as_view(),name="subadmin-client-list"),  #U
    path("api/clients/assign/",views.SubAdminClientAssignAPIView.as_view(),name="subadmin-client-assign"),  #N U
    path("api/clients/revoke/",views.SubAdminClientRevokeAPIView.as_view(),name="subadmin-client-revoke"),   #N U
    path("api/clients/<int:client_id>/soft-delete/", views.SubAdminClientSoftDeleteAPIView.as_view()), #N U
    path("api/clients/<int:client_id>/restore/", views.SubAdminClientRestoreAPIView.as_view()),  #N U
    path("api/clients/<int:client_id>/hard-delete/", views.SubAdminClientHardDeleteAPIView.as_view()),  #N U
    #=====================Candidate=====================================
    path("candidates/<int:pk>/soft-delete/", views.SubAdminCandidateSoftDeleteAPIView.as_view()),  #U N
    path("candidates/<int:pk>/restore/", views.SubAdminCandidateRestoreAPIView.as_view()),  #U N
    path("candidates/<int:pk>/hard-delete/", views.SubAdminCandidateHardDeleteAPIView.as_view()),  #U N
    
    #=====================================
    path("api/candidates/submitted/",views.SubAdminSubmittedProfilesAPIView.as_view(),name="subadmin-submitted-profiles",),
    path("api/dashboard/today-profiles/",views.SubAdminTodayProfilesAPIView.as_view(),name="subadmin-today-profiles",),

    path("api/candidates/onboard/",views.SubAdminOnboardProfilesAPIView.as_view(),name="subadmin-onboard-profiles",),
]
