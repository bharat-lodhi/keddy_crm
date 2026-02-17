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
    
]
