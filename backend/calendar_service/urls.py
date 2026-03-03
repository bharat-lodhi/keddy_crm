from django.urls import path
from . import views
app_name = 'calender'
urlpatterns = [
    path("google/connect/", views.google_connect, name="google_connect"),
    path("google/callback/", views.google_callback, name="google_callback"),
    path("google/test/", views.test_google_api, name="google_test"),
    
    path("google/create-event/", views.create_candidate_event, name="create_candidate_event"),
    path("google/event-history/<int:candidate_id>/", views.candidate_event_history, name="candidate_event_history"),
]