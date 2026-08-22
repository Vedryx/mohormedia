import { createSign } from 'node:crypto';

// Appending one row is the only thing we do, so we implement Google's JWT-bearer
// flow directly rather than pulling in `googleapis` (tens of MB, slow cold
// starts) or `google-auth-library`. The flow is stable and documented at
// https://developers.google.com/identity/protocols/oauth2/service-account

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

const base64url = (input) =>
  Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/**
 * Vercel's env var UI stores newlines escaped, so a pasted PEM arrives as the
 * literal characters \n. Restore them or the signer rejects the key.
 */
function normalisePrivateKey(key) {
  return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
}

export async function getAccessToken({ clientEmail, privateKey }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );

  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const signature = signer
    .sign(normalisePrivateKey(privateKey), 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
  });

  if (!response.ok) {
    // Google echoes the request in errors; keep it out of logs.
    throw new Error(`Google token exchange failed (${response.status})`);
  }

  const { access_token: accessToken } = await response.json();
  if (!accessToken) throw new Error('Google token exchange returned no access token');
  return accessToken;
}

/**
 * Append one row to the first sheet of a spreadsheet.
 *
 * The service account must be given Editor access to the sheet by sharing it
 * with the account's email address — it has no implicit access.
 */
export async function appendRow({ spreadsheetId, sheetName = 'Sheet1', values }) {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Google service account credentials are not configured');
  }

  const accessToken = await getAccessToken({ clientEmail, privateKey });

  const range = encodeURIComponent(`${sheetName}!A:Z`);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append` +
    '?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ values: [values] }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    // Server-side log only — the handler never forwards this to the visitor —
    // so keep enough of it to include Google's remediation URL.
    throw new Error(`Sheets append failed (${response.status}): ${detail.slice(0, 600)}`);
  }

  return response.json();
}

/** The columns appendRow writes, in order. */
export const COLUMNS = ['Timestamp', 'Name', 'Email', 'Brief', 'Referer'];

/**
 * Overwrite an exact range. Used to seed the header row; append cannot target
 * row 1 once anything else is present.
 */
export async function updateRange({ spreadsheetId, range, values }) {
  const accessToken = await getAccessToken({
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY,
  });

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/` +
    `${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Sheets update failed (${response.status}): ${detail.slice(0, 600)}`);
  }
  return response.json();
}
