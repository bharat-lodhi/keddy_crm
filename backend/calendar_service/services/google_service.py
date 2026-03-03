import requests
from django.utils import timezone
from calendar_service.models import GoogleCalendarAccount


def test_google_connection(user):
    """
    Tests whether stored access token works by fetching
    user's primary calendar details.
    """

    try:
        account = GoogleCalendarAccount.objects.get(user=user, is_active=True)
    except GoogleCalendarAccount.DoesNotExist:
        return {"error": "Google account not connected."}

    if account.token_expiry <= timezone.now():
        return {"error": "Access token expired."}

    headers = {
        "Authorization": f"Bearer {account.access_token}"
    }

    response = requests.get(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList/primary",
        headers=headers
    )

    if response.status_code == 200:
        return response.json()
    else:
        return {
            "error": "Google API call failed.",
            "details": response.json()
        }
        
from datetime import datetime


# def create_google_event(user, title, description, start_datetime, end_datetime):
#     try:
#         account = GoogleCalendarAccount.objects.get(user=user, is_active=True)
#     except GoogleCalendarAccount.DoesNotExist:
#         return {"error": "Google account not connected."}

#     headers = {
#         "Authorization": f"Bearer {account.access_token}",
#         "Content-Type": "application/json"
#     }

#     event_data = {
#         "summary": title,
#         "description": description,
#         "start": {
#             "dateTime": start_datetime.isoformat(),
#             "timeZone": "Asia/Kolkata",
#         },
#         "end": {
#             "dateTime": end_datetime.isoformat(),
#             "timeZone": "Asia/Kolkata",
#         },

#         # 👇 THIS IS IMPORTANT
#         "attendees": [
#             {"email": user.email}
#         ],

#         # 👇 Custom Reminders
#         "reminders": {
#             "useDefault": False,
#             "overrides": [
#                 {"method": "popup", "minutes": 30},
#                 {"method": "email", "minutes": 0}   # Email exactly at event time
#             ],
#         },
#     }

#     response = requests.post(
#         "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
#         headers=headers,
#         json=event_data
#     )

#     if response.status_code == 200:
#         return response.json()
#     else:
#         return {
#             "error": "Failed to create event",
#             "details": response.json()
#         }



# ===========================================================
import os
import requests
from django.utils import timezone
from datetime import timedelta
from calendar_service.models import GoogleCalendarAccount


# =========================================
# 🔁 TOKEN REFRESH FUNCTION
# =========================================
def refresh_access_token(account):

    if not account.refresh_token:
        return None

    token_url = "https://oauth2.googleapis.com/token"

    data = {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "refresh_token": account.refresh_token,
        "grant_type": "refresh_token",
    }

    response = requests.post(token_url, data=data)
    token_json = response.json()

    if "access_token" in token_json:
        account.access_token = token_json["access_token"]

        expires_in = token_json.get("expires_in", 3600)
        account.token_expiry = timezone.now() + timedelta(seconds=expires_in)

        account.save()
        return account.access_token

    return None


# =========================================
# 📅 CREATE GOOGLE EVENT (AUTO REFRESH SAFE)
# =========================================
def create_google_event(user, title, description, start_datetime, end_datetime):

    try:
        account = GoogleCalendarAccount.objects.get(user=user, is_active=True)
    except GoogleCalendarAccount.DoesNotExist:
        return {"error": "Google account not connected."}

    # 🔁 Check Expiry Before Call
    if account.token_expiry and account.token_expiry <= timezone.now():
        new_token = refresh_access_token(account)
        if not new_token:
            return {"error": "Failed to refresh access token."}

    headers = {
        "Authorization": f"Bearer {account.access_token}",
        "Content-Type": "application/json"
    }

    event_data = {
        "summary": title,
        "description": description,
        "start": {
            "dateTime": start_datetime.isoformat(),
            "timeZone": "Asia/Kolkata",
        },
        "end": {
            "dateTime": end_datetime.isoformat(),
            "timeZone": "Asia/Kolkata",
        },
        "attendees": [
            {"email": user.email}
        ],
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "popup", "minutes": 30},
                {"method": "email", "minutes": 0},
            ],
        },
    }

    response = requests.post(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
        headers=headers,
        json=event_data
    )

    # 🔁 If still 401 → try one more refresh
    if response.status_code == 401:
        new_token = refresh_access_token(account)
        if not new_token:
            return {"error": "Authentication failed after refresh."}

        headers["Authorization"] = f"Bearer {new_token}"

        response = requests.post(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
            headers=headers,
            json=event_data
        )

    if response.status_code == 200:
        return response.json()

    return {
        "error": "Failed to create event",
        "details": response.json()
    }