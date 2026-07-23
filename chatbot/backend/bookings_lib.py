import os
import sys
from datetime import datetime
from pydantic import BaseModel, EmailStr

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from rag_lib import get_connection


class Booking(BaseModel):
    id: int | None = None
    visitor_name: str
    visitor_email: EmailStr
    visitor_phone: str | None = None
    start_iso: datetime
    duration_minutes: int
    location: str | None = None
    note: str | None = None
    calendar_event_id: str | None = None
    calendar_html_link: str | None = None
    created_at: datetime | None = None


def insert_booking(booking: Booking) -> Booking:
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute(
            """INSERT INTO bookings
               (visitor_name, visitor_email, visitor_phone, start_iso, duration_minutes,
                location, note, calendar_event_id, calendar_html_link)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
               RETURNING id, created_at""",
            (
                booking.visitor_name,
                booking.visitor_email,
                booking.visitor_phone,
                booking.start_iso,
                booking.duration_minutes,
                booking.location,
                booking.note,
                booking.calendar_event_id,
                booking.calendar_html_link,
            ),
        )
        row_id, created_at = cur.fetchone()
        conn.commit()
    return booking.model_copy(update={"id": row_id, "created_at": created_at})


def find_bookings(email: str | None = None, phone: str | None = None) -> list[Booking]:
    if not email and not phone:
        return []
    with get_connection() as conn, conn.cursor() as cur:
        cur.execute(
            """SELECT id, visitor_name, visitor_email, visitor_phone, start_iso, duration_minutes,
                      location, note, calendar_event_id, calendar_html_link, created_at
               FROM bookings WHERE visitor_email = %s OR visitor_phone = %s
               ORDER BY start_iso DESC""",
            (email, phone),
        )
        rows = cur.fetchall()
    return [
        Booking(
            id=r[0], visitor_name=r[1], visitor_email=r[2], visitor_phone=r[3],
            start_iso=r[4], duration_minutes=r[5], location=r[6], note=r[7],
            calendar_event_id=r[8], calendar_html_link=r[9], created_at=r[10],
        )
        for r in rows
    ]
