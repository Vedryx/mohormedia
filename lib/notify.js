const RESEND_URL = 'https://api.resend.com/emails';

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Email the studio when a booking comes in, so nobody has to watch the sheet.
 *
 * Deliberately best-effort: the caller treats a failure here as non-fatal,
 * because the row is already safe in the spreadsheet and the visitor should not
 * see an error for a notification they know nothing about.
 */
export async function sendBookingAlert({ name, email, brief }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_ALERT_TO;
  const from = process.env.BOOKING_ALERT_FROM;

  if (!apiKey || !to || !from) return { skipped: true };

  const rows = [
    ['Name', name],
    ['Email', email],
    ['About their brand', brief || '—'],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#8a8c74;font:600 12px sans-serif;` +
        `letter-spacing:.08em;text-transform:uppercase;vertical-align:top">${label}</td>` +
        `<td style="padding:6px 0;color:#22261a;font:400 15px/1.5 sans-serif">` +
        `${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: to.split(',').map((address) => address.trim()),
      // Replying to the alert reaches the prospect directly.
      reply_to: email,
      subject: `New call request — ${name}`,
      html:
        `<div style="max-width:520px;font-family:sans-serif">` +
        `<p style="font:600 13px sans-serif;letter-spacing:.2em;text-transform:uppercase;` +
        `color:#e2913f;margin:0 0 14px">Mohor Media · new booking</p>` +
        `<table style="border-collapse:collapse">${rows}</table>` +
        `<p style="margin:22px 0 0;color:#5c6146;font:400 13px sans-serif">` +
        `Reply to this email to reach them directly.</p></div>`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Resend failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  return response.json();
}
