import os
from typing import Optional
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


def _get_credentials() -> Credentials:
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    refresh_token = os.environ.get("GOOGLE_REFRESH_TOKEN")
    if not client_id or not client_secret or not refresh_token:
        raise RuntimeError(
            "Google Calendar is not configured. Set GOOGLE_CLIENT_ID, "
            "GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN (see "
            "scripts/get-google-refresh-token.ts)."
        )
    return Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
    )


def _calendar_service():
    return build("calendar", "v3", credentials=_get_credentials(), cache_discovery=False)


def is_slot_free(start_iso: str, end_iso: str) -> bool:
    result = _calendar_service().freebusy().query(body={
        "timeMin": start_iso,
        "timeMax": end_iso,
        "items": [{"id": "primary"}],
    }).execute()
    busy = result.get("calendars", {}).get("primary", {}).get("busy", [])
    return len(busy) == 0


def create_booking_event(
    visitor_name: str,
    visitor_email: str,
    start_iso: str,
    end_iso: str,
    location: Optional[str] = None,
    note: Optional[str] = None,
) -> dict:
    owner_email = os.environ.get("OWNER_EMAIL", "andrews.trinh@gmail.com")
    event_body = {
        "summary": f"Chat with Andrew — {visitor_name}",
        "description": note or "Booked via andrew's resume chatbot.",
        "start": {"dateTime": start_iso},
        "end": {"dateTime": end_iso},
        "attendees": [
            {"email": owner_email},
            {"email": visitor_email, "displayName": visitor_name},
        ],
    }
    if location:
        event_body["location"] = location

    result = _calendar_service().events().insert(
        calendarId="primary", sendUpdates="all", body=event_body
    ).execute()
    return {"event_id": result.get("id"), "html_link": result.get("htmlLink")}
