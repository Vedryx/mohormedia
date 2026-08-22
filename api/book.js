import { appendRow } from '../lib/google-sheets.js';
import { sendBookingAlert } from '../lib/notify.js';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

const LIMITS = { name: 120, email: 200, brief: 2000 };

// A booking form is a slow, deliberate action. Anything faster than this is a
// script, not a person.
const MIN_FILL_MS = 2500;

function readBody(req) {
  // Vercel's Node runtime parses JSON bodies, but not on every path (and never
  // for `vercel dev` with some configs), so fall back to reading the stream.
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.resolve(null);
    }
  }
  // Not a readable stream (empty body, or an unusual runtime shape) — treat it
  // as absent rather than throwing out of the handler.
  if (typeof req.on !== 'function') return Promise.resolve(null);

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

/** Trim, collapse whitespace and cap length. */
function clean(value, max) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

// Deliberately permissive: the goal is to reject obvious junk, not to police
// valid-but-unusual addresses.
const looksLikeEmail = (value) => /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(value);

export default async function handler(req, res) {
  try {
    return await handleBooking(req, res);
  } catch (error) {
    console.error('Booking handler crashed:', error);
    return res.status(500).json({ error: 'Something went wrong. Please email us instead.' });
  }
}

async function handleBooking(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = await readBody(req);
  if (!body) return res.status(400).json({ error: 'Invalid request' });

  // Honeypot: a real person never fills a field they cannot see.
  if (clean(body.company, 200)) {
    // Report success so the bot has no signal to adapt to.
    return res.status(200).json({ ok: true });
  }

  // Submitted implausibly fast — same silent treatment.
  const elapsed = Number(body.elapsedMs);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const brief = clean(body.brief, LIMITS.brief);

  if (!name) return res.status(400).json({ error: 'Please add your name.' });
  if (!looksLikeEmail(email)) {
    return res.status(400).json({ error: 'Please check your email address.' });
  }

  if (!SHEET_ID) {
    console.error('GOOGLE_SHEET_ID is not configured');
    return res.status(500).json({ error: 'Something went wrong. Please email us instead.' });
  }

  const submittedAt = new Date().toISOString();

  try {
    await appendRow({
      spreadsheetId: SHEET_ID,
      sheetName: SHEET_NAME,
      // Column order must match the sheet's header row.
      values: [submittedAt, name, email, brief, req.headers['referer'] || ''],
    });
  } catch (error) {
    // The visitor cannot act on the cause, and the message may carry detail we
    // do not want to expose — log it, return something human.
    console.error('Booking append failed:', error.message);
    return res.status(502).json({ error: 'Something went wrong. Please email us instead.' });
  }

  // The row is saved; a failed notification must not fail the request.
  try {
    await sendBookingAlert({ name, email, brief });
  } catch (error) {
    console.error('Booking alert failed:', error.message);
  }

  return res.status(200).json({ ok: true });
}
