import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import { isSlotFree, createBookingEvent } from '../calendar';
import { sendBookingNotification } from '../email';
import type { ChatUIMessage } from '../types';

export const bookingInputSchema = z.object({
  visitorName: z.string().min(1).describe("The visitor's full name."),
  visitorEmail: z.string().email().describe("The visitor's email address."),
  startISO: z.string().describe('Requested meeting start time, ISO 8601, e.g. 2026-07-20T14:00:00+10:00.'),
  durationMinutes: z.number().min(15).max(120).default(30).describe('Meeting length in minutes.'),
  note: z.string().optional().describe('Optional note about what the visitor wants to discuss.'),
});

// This tool is gated behind toolApproval: 'user-approval' in the chat route —
// execute() only ever runs after the visitor explicitly confirms the booking
// card in the UI, so a prompt-injected instruction cannot trigger a real booking.
export function createBookingTool(writer: UIMessageStreamWriter<ChatUIMessage>) {
  return tool({
    description:
      "Book a real meeting on Andrew's calendar. Requires the visitor's name, email, a requested start time, and duration. This will check Andrew's real availability, create a calendar event that invites both parties, and notify Andrew by email. The visitor must confirm before this runs — do not call this tool speculatively.",
    inputSchema: bookingInputSchema,
    execute: async ({ visitorName, visitorEmail, startISO, durationMinutes, note }, { toolCallId }) => {
      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: { toolCallId, toolName: 'booking', label: 'Checking calendar availability…', status: 'running' },
      });

      const start = new Date(startISO);
      const end = new Date(start.getTime() + durationMinutes * 60_000);

      const free = await isSlotFree(start.toISOString(), end.toISOString());
      if (!free) {
        writer.write({
          type: 'data-trace',
          id: toolCallId,
          data: { toolCallId, toolName: 'booking', label: 'That slot is busy', status: 'done' },
        });
        return { booked: false, reason: 'That time is already booked — ask the visitor to suggest another slot.' };
      }

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: { toolCallId, toolName: 'booking', label: 'Creating calendar event…', status: 'running' },
      });

      const event = await createBookingEvent({
        visitorName,
        visitorEmail,
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        note,
      });

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: { toolCallId, toolName: 'booking', label: 'Sending notification email…', status: 'running' },
      });

      await sendBookingNotification({
        visitorName,
        visitorEmail,
        requestedTime: start.toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' }),
        note,
        calendarLink: event.htmlLink,
      });

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: { toolCallId, toolName: 'booking', label: 'Booked', status: 'done', detail: event.htmlLink ?? undefined },
      });

      return { booked: true, calendarLink: event.htmlLink };
    },
  });
}
