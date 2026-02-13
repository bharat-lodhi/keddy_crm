from django.urls import path
from . import views
app_name = 'landing'

urlpatterns = [
    path("api/register/", views.RegisterAPIView.as_view(), name="api-register"),
    path("api/login/", views.LoginAPIView.as_view(), name="api-login"),
]

