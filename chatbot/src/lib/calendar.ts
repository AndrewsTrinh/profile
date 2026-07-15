import { google } from 'googleapis';

function getOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error(
      'Google Calendar is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN (see scripts/get-google-refresh-token.ts).',
    );
  }
  const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return client;
}

export async function isSlotFree(startISO: string, endISO: string): Promise<boolean> {
  const auth = getOAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });
  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin: startISO,
      timeMax: endISO,
      items: [{ id: 'primary' }],
    },
  });
  const busy = data.calendars?.primary?.busy ?? [];
  return busy.length === 0;
}

export async function createBookingEvent(input: {
  visitorName: string;
  visitorEmail: string;
  startISO: string;
  endISO: string;
  note?: string;
}) {
  const auth = getOAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });
  const ownerEmail = process.env.OWNER_EMAIL ?? 'andrews.trinh@gmail.com';

  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    sendUpdates: 'all',
    requestBody: {
      summary: `Chat with Andrew — ${input.visitorName}`,
      description: input.note ?? 'Booked via andrew\'s resume chatbot.',
      start: { dateTime: input.startISO },
      end: { dateTime: input.endISO },
      attendees: [{ email: ownerEmail }, { email: input.visitorEmail, displayName: input.visitorName }],
    },
  });

  return { eventId: data.id, htmlLink: data.htmlLink };
}
