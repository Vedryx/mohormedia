import { google } from 'googleapis'
import crypto from 'node:crypto'

// ---- Booking config (kept in sync with src/contact/booking.js) ----
const TZ = 'Asia/Kolkata'
function makeSlots(startH = 10, endExclH = 24, stepMin = 15) {
  const out = []
  for (let m = startH * 60; m < endExclH * 60; m += stepMin) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return out
}
const SLOTS = makeSlots(10, 24, 15)
const SLOT_MINUTES = 15
const HORIZON_DAYS = 14
const MEETING_TITLE = process.env.BOOKING_TITLE || 'Mohor Media — 15-minute call'

// All Google/Resend credentials come from env — set them on the Vercel project.
const NOTIFY = process.env.BOOKING_NOTIFY_EMAIL || ''      // Mohor inbox that gets the "new booking" email
const IMPERSONATE = process.env.GOOGLE_CALENDAR_IMPERSONATE || '' // Google user whose calendar hosts the event
const FROM = process.env.BOOKING_FROM || ''                 // verified Resend sender, e.g. "Mohor Media <bookings@…>"
const REPLY_TO = process.env.BOOKING_REPLY_TO || NOTIFY

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?\d{7,15}$/

function istInstant(dateStr, timeStr) { return new Date(`${dateStr}T${timeStr}:00+05:30`) }

function istToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}
function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00+05:30`)
  d.setUTCDate(d.getUTCDate() + n)
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}
function prettyWhen(dateStr, timeStr) {
  const end = SLOTS.includes(timeStr) ? new Date(istInstant(dateStr, timeStr).getTime() + SLOT_MINUTES * 60000) : null
  const dateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(istInstant(dateStr, timeStr))
  const t = (d) => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: true }).format(d)
  return `${dateFmt} · ${t(istInstant(dateStr, timeStr))}–${end ? t(end) : ''} IST`
}

function saAuth() {
  const raw = process.env.GOOGLE_SA_KEY_JSON
  if (!raw) throw new Error('GOOGLE_SA_KEY_JSON not set')
  const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  const key = JSON.parse(json)
  return new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
    subject: IMPERSONATE || undefined,
  })
}

async function sendEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not set')
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text().catch(() => '')}`)
  return r.json()
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
const escapeAttr = escapeHtml

function guestEmailHtml({ name, whenStr, meetLink }) {
  const hi = name ? `Hi ${escapeHtml(name)},` : 'Hi,'
  return `<!doctype html><html><body style="margin:0;background:#2c3419;font-family:Georgia,'Times New Roman',serif;color:#f6f1e7;">
  <div style="max-width:520px;margin:0 auto;padding:36px 24px;">
    <div style="font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:#e2913f;">Mohor Media</div>
    <h1 style="font-size:24px;font-weight:500;margin:14px 0 8px;">Your call is booked</h1>
    <p style="margin:0 0 18px;line-height:1.6;color:rgba(246,241,231,.8);">${hi} thanks for booking a 15-minute call with Mohor Media. Details below.</p>
    <div style="border:1px solid rgba(226,145,63,.35);border-radius:6px;padding:18px 20px;margin:0 0 20px;background:rgba(226,145,63,.06);">
      <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,241,231,.55);margin-bottom:6px;">When</div>
      <div style="font-size:17px;margin-bottom:16px;">${escapeHtml(whenStr)}</div>
      <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:rgba(246,241,231,.55);margin-bottom:6px;">Google Meet</div>
      <a href="${escapeAttr(meetLink)}" style="color:#edb96a;font-size:15px;word-break:break-all;">${escapeHtml(meetLink)}</a>
    </div>
    <a href="${escapeAttr(meetLink)}" style="display:inline-block;background:#e2913f;color:#221a0c;text-decoration:none;padding:12px 22px;border-radius:4px;font-size:15px;font-weight:600;">Join the Meet</a>
    <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:rgba(246,241,231,.5);">A Google Calendar invite with the same link is on its way. Need to reschedule? Just reply to this email.</p>
    <p style="margin:20px 0 0;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(246,241,231,.3);">mohormedia.com</p>
  </div></body></html>`
}

function hostEmailHtml({ name, email, phone, whenStr, meetLink }) {
  return `<!doctype html><html><body style="font-family:system-ui,Arial,sans-serif;color:#111;">
    <h2 style="margin:0 0 10px;">New call booked — Mohor Media</h2>
    <table style="border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td>${escapeHtml(name || '—')}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td>${escapeHtml(email)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td>${escapeHtml(phone)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">When</td><td>${escapeHtml(whenStr)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Meet</td><td><a href="${escapeAttr(meetLink)}">${escapeHtml(meetLink)}</a></td></tr>
    </table></body></html>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {}
  const name = (body.name || '').toString().trim().slice(0, 120)
  const email = (body.email || '').toString().trim().slice(0, 254)
  const phone = (body.phone || '').toString().trim().slice(0, 30)
  const date = (body.date || '').toString().trim()
  const time = (body.time || '').toString().trim()
  const phoneDigits = phone.replace(/[\s()\-.]/g, '')

  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Enter a valid email address.' })
  if (!PHONE_RE.test(phoneDigits)) return res.status(400).json({ ok: false, error: 'Enter a valid phone number.' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ ok: false, error: 'Pick a date.' })
  if (!SLOTS.includes(time)) return res.status(400).json({ ok: false, error: 'Pick a valid time slot.' })

  const today = istToday()
  if (date < today || date > addDays(today, HORIZON_DAYS)) return res.status(400).json({ ok: false, error: 'That date is outside the booking window.' })

  const start = istInstant(date, time)
  if (start.getTime() <= Date.now()) return res.status(400).json({ ok: false, error: 'That slot is in the past — pick another.' })
  const end = new Date(start.getTime() + SLOT_MINUTES * 60000)
  const whenStr = prettyWhen(date, time)

  // guard: booking backend not yet configured (credentials pending)
  if (!process.env.GOOGLE_SA_KEY_JSON || !IMPERSONATE) {
    console.error('booking not configured: missing Google credentials')
    return res.status(503).json({ ok: false, error: 'Booking isn’t live yet — please call or WhatsApp us for now.' })
  }

  let meetLink = ''
  let eventId = ''
  try {
    const cal = google.calendar({ version: 'v3', auth: saAuth() })
    const ev = await cal.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: {
        summary: MEETING_TITLE,
        description: `15-minute intro call with Mohor Media.${name ? `\nGuest: ${name}` : ''}\nPhone: ${phone}\nEmail: ${email}\nBooked via contact.mohormedia.com`,
        start: { dateTime: start.toISOString(), timeZone: TZ },
        end: { dateTime: end.toISOString(), timeZone: TZ },
        attendees: [{ email }, ...(NOTIFY ? [{ email: NOTIFY, organizer: true, responseStatus: 'accepted' }] : [])],
        conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
        reminders: { useDefault: true },
      },
    })
    eventId = ev.data.id || ''
    meetLink = ev.data.hangoutLink || ev.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri || ''
  } catch (err) {
    console.error('calendar insert failed:', err?.message || err)
    return res.status(502).json({ ok: false, error: 'Could not create the calendar event. Please try again.' })
  }

  if (!meetLink) {
    console.error('event created but no Meet link', eventId)
    return res.status(502).json({ ok: false, error: 'Booking created but the Meet link failed. We’ll email you shortly.' })
  }

  const emailWarnings = []
  if (FROM && process.env.RESEND_API_KEY) {
    try {
      await sendEmail({ from: FROM, to: [email], reply_to: REPLY_TO || undefined, subject: `Your Mohor Media call — ${whenStr}`, html: guestEmailHtml({ name, whenStr, meetLink }) })
    } catch (e) { emailWarnings.push('guest'); console.error('guest email failed:', e?.message) }
    if (NOTIFY) {
      try {
        await sendEmail({ from: FROM, to: [NOTIFY], reply_to: email, subject: `New call booked — ${name || email} — ${whenStr}`, html: hostEmailHtml({ name, email, phone, whenStr, meetLink }) })
      } catch (e) { emailWarnings.push('host'); console.error('host email failed:', e?.message) }
    }
  } else {
    emailWarnings.push('email-not-configured')
  }

  return res.status(200).json({ ok: true, meetLink, whenStr, eventId, emailWarnings })
}

function safeParse(s) { try { return JSON.parse(s) } catch { return {} } }
