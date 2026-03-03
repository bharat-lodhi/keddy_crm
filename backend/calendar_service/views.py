import os
from urllib.parse import urlencode

from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def google_connect(request):
    """
    Redirects authenticated user to Google OAuth consent screen.
    """

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")

    if not client_id or not redirect_uri:
        return Response(
            {"error": "Google OAuth credentials not configured properly."},
            status=500
        )

    scope = "https://www.googleapis.com/auth/calendar"

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": scope,
        "access_type": "offline",   # required for refresh token
        "prompt": "consent",        # force refresh token
    }

    oauth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)

    return redirect(oauth_url)

import os
import requests
from django.shortcuts import redirect
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import GoogleCalendarAccount


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def google_callback(request):
    """
    Handles Google OAuth callback and stores tokens.
    """

    code = request.GET.get("code")

    if not code:
        return Response({"error": "Authorization code not received."}, status=400)

    token_url = "https://oauth2.googleapis.com/token"

    data = {
        "code": code,
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
        "grant_type": "authorization_code",
    }

    token_response = requests.post(token_url, data=data)
    token_json = token_response.json()

    if "access_token" not in token_json:
        return Response({"error": "Failed to retrieve access token.", "details": token_json}, status=400)

    access_token = token_json.get("access_token")
    refresh_token = token_json.get("refresh_token")
    expires_in = token_json.get("expires_in")

    token_expiry = timezone.now() + timedelta(seconds=expires_in)

    # Create or Update User Calendar Account
    account, created = GoogleCalendarAccount.objects.update_or_create(
        user=request.user,
        defaults={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_expiry": token_expiry,
            "is_active": True,
        },
    )

    return Response({
        "message": "Google Calendar connected successfully.",
        "email": request.user.email
    })
    

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services.google_service import test_google_connection


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def test_google_api(request):
    result = test_google_connection(request.user)
    return Response(result)

# =========create -event api-----

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_datetime
from django.db import transaction

from employee_portal.models import Candidate
from .models import CandidateCalendarEvent, CandidateCalendarEventHistory
from .services.google_service import create_google_event


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_candidate_event(request):
    """
    Create or Update Google Calendar event for a candidate.
    Company level control.
    """

    candidate_id = request.data.get("candidate_id")
    title = request.data.get("title")
    description = request.data.get("description")
    start_datetime = parse_datetime(request.data.get("start_datetime"))
    end_datetime = parse_datetime(request.data.get("end_datetime"))

    if not all([candidate_id, title, start_datetime, end_datetime]):
        return Response({"error": "Missing required fields"}, status=400)

    try:
        candidate = Candidate.objects.get(id=candidate_id, is_deleted=False)
    except Candidate.DoesNotExist:
        return Response({"error": "Candidate not found"}, status=404)

    # Google Event Create
    google_response = create_google_event(
        user=request.user,
        title=title,
        description=description,
        start_datetime=start_datetime,
        end_datetime=end_datetime
    )

    if "error" in google_response:
        return Response(google_response, status=400)

    google_event_id = google_response.get("id")

    # Check if event already exists
    event_obj, created = CandidateCalendarEvent.objects.update_or_create(
    candidate=candidate,
    defaults={
            "google_event_id": google_event_id,
            "event_title": title,
            "event_description": description,
            "start_datetime": start_datetime,
            "end_datetime": end_datetime,
            "updated_by": request.user,
            "is_cancelled": False,
        }
    )

    if created:
        event_obj.created_by = request.user
        event_obj.save()

    # History entry
    CandidateCalendarEventHistory.objects.create(
        event=event_obj,
        action_type="CREATED" if created else "UPDATED",
        new_start_datetime=start_datetime,
        new_end_datetime=end_datetime,
        changed_by=request.user,
        change_reason="Created via API"
    )

    return Response({
        "message": "Event created successfully",
        "google_event_id": google_event_id
    })
    
# ===============================================================

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from employee_portal.models import Candidate
from .models import CandidateCalendarEvent, CandidateCalendarEventHistory

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def candidate_event_history(request, candidate_id):

    try:
        candidate = Candidate.objects.get(id=candidate_id, is_deleted=False)
    except Candidate.DoesNotExist:
        return Response({"error": "Candidate not found"}, status=404)

    history = CandidateCalendarEventHistory.objects.filter(
        event__candidate=candidate
    ).order_by("-created_at", "-id")

    history_data = [
        {
            "candidate_name": candidate.candidate_name,
            "action_type": h.action_type,

            "previous_title": h.previous_title,
            "new_title": h.new_title,

            "previous_description": h.previous_description,
            "new_description": h.new_description,

            "previous_start": h.previous_start_datetime,
            "previous_end": h.previous_end_datetime,

            "new_start": h.new_start_datetime,
            "new_end": h.new_end_datetime,

            "changed_by": h.changed_by.email if h.changed_by else None,
            "created_at": h.created_at,
        }
        for h in history
    ]

    return Response({
        "candidate_id": candidate.id,
        "candidate_name": candidate.candidate_name,
        "history": history_data
    })