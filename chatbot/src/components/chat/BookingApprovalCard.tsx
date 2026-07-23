import type { bookingInputSchema } from '@/lib/tools/booking-types';
import type { z } from 'zod';

type BookingInput = z.infer<typeof bookingInputSchema>;

export function BookingApprovalCard({
  input,
  onRespond,
}: {
  input: BookingInput;
  onRespond: (approved: boolean) => void;
}) {
  const start = new Date(input.startISO);

  return (
    <div className="mt-2 rounded-xl border border-ctp-mauve/50 bg-ctp-surface0 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ctp-mauve">☕ Coffee Chat Invitation</p>
      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-ctp-subtext0">Name</dt>
          <dd className="text-ctp-text">{input.visitorName}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-ctp-subtext0">Email</dt>
          <dd className="text-ctp-text">{input.visitorEmail}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-ctp-subtext0">When</dt>
          <dd className="text-ctp-text">
            {start.toLocaleString('en-AU', { dateStyle: 'full', timeStyle: 'short' })} ({input.durationMinutes}min)
          </dd>
        </div>
        {input.location && (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ctp-subtext0">Location</dt>
            <dd className="text-ctp-text">{input.location}</dd>
          </div>
        )}
        {input.visitorPhone && (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ctp-subtext0">Phone</dt>
            <dd className="text-ctp-text">{input.visitorPhone}</dd>
          </div>
        )}
        {input.note && (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-ctp-subtext0">Note</dt>
            <dd className="text-ctp-text">{input.note}</dd>
          </div>
        )}
      </dl>
      <p className="mt-3 text-xs text-ctp-subtext0">
        Leave your details here and I&apos;ll see you for a coffee chat! Let&apos;s talk about AI, data, and everything in between.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onRespond(true)}
          className="rounded-lg bg-ctp-mauve px-4 py-1.5 text-sm font-semibold text-ctp-crust hover:opacity-90"
        >
          Schedule Chat
        </button>
        <button
          type="button"
          onClick={() => onRespond(false)}
          className="rounded-lg border border-ctp-surface1 px-4 py-1.5 text-sm text-ctp-subtext1 hover:border-ctp-red hover:text-ctp-red"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
