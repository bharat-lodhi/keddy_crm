from django.urls import path
from . import views
app_name = 'sub_admin'

urlpatterns = [
    # Sub-Admin Dashboard Stats (sabhi employees ka data)
    path("api/subadmin/dashboard/stats/", views.dashboard_stats, name="subadmin-dashboard-stats"),

    # Today Verified Profiles (sabhi employees)
    path("api/subadmin/dashboard/today-verified/", views.today_verified_candidates, name="subadmin-today-verified"),

    # Pipeline Candidates (sabhi employees pipeline)
    path("api/subadmin/dashboard/pipeline/", views.active_pipeline_candidates, name="subadmin-pipeline"),
    
    #=================User-management=================
    # LIST (employees only) + CREATE (any role)
    path("api/users/", views.SubAdminUserListCreateAPIView.as_view(), name="subadmin-users"),

    # UPDATE (employee only)
    path("api/users/<int:pk>/", views.SubAdminUserUpdateAPIView.as_view(), name="subadmin-user-update"),
    
    #=================All-profiles=============================
    path("api/admin-candidates/",views.AdminCandidateListAPIView.as_view(),name="admin-candidate-list",),
    # All Vendors
    path("api/admin-vendors/",views.AdminVendorFullListAPIView.as_view(),name="admin-vendor-list",),
    #  all Client list
    path("api/admin-clients/",views.AdminClientListAPIView.as_view(),name="admin-client-list", ),
    #==========================================================
    
]
