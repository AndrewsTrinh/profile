import { Resend } from 'resend';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export async function sendBookingNotification(input: {
  visitorName: string;
  visitorEmail: string;
  requestedTime: string;
  note?: string;
  calendarLink?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set — cannot send booking notification.');
  }
  const resend = new Resend(apiKey);
  const ownerEmail = process.env.OWNER_EMAIL ?? 'andrews.trinh@gmail.com';

  const rows: [string, string][] = [
    ['Name', input.visitorName],
    ['Email', input.visitorEmail],
    ['Requested time', input.requestedTime],
    ['Note', input.note ?? '—'],
  ];

  const html = `
    <h2>New booking via your resume chatbot</h2>
    <table style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value], i) => `
        <tr style="background:${i % 2 === 0 ? '#f4f0fb' : '#ffffff'}">
          <td style="padding:8px 12px;font-weight:bold;border:1px solid #cba6f7">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border:1px solid #cba6f7">${escapeHtml(value)}</td>
        </tr>`,
        )
        .join('')}
    </table>
    ${input.calendarLink ? `<p><a href="${input.calendarLink}">View in Google Calendar</a></p>` : ''}
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'Andrew\'s Chatbot <onboarding@resend.dev>',
    to: ownerEmail,
    subject: `New booking request from ${input.visitorName}`,
    html,
  });
}
