import { z } from 'zod';

export const bookingInputSchema = z.object({
  visitorName: z.string().min(1).describe("The visitor's full name."),
  visitorEmail: z.string().email().describe("The visitor's email address."),
  startISO: z.string().describe('Requested meeting start time, ISO 8601, e.g. 2026-07-20T14:00:00+10:00.'),
  durationMinutes: z.number().min(15).max(120).default(30).describe('Meeting length in minutes.'),
  location: z.string().optional().describe('Preferred meeting location — a video call platform/link, phone, or in-person address.'),
  visitorPhone: z.string().optional().describe("The visitor's phone number, optional — lets them look up this booking later via lookup_booking."),
  note: z.string().optional().describe('Optional note about what the visitor wants to discuss.'),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;
