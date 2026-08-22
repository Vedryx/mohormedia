/**
 * Smoke test for /api/book.
 *
 * Runs the real handler against a stubbed fetch and a throwaway RSA key, so the
 * JWT signing, the Sheets request shape and every guard are exercised without
 * touching Google or Resend. Run with: npm run test:book
 */
import { generateKeyPairSync, createVerify } from 'node:crypto';
import assert from 'node:assert/strict';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'bookings@mohor.iam.gserviceaccount.com';
// Stored escaped, exactly as Vercel's env UI hands it back.
process.env.GOOGLE_PRIVATE_KEY = privateKey.replace(/\n/g, '\\n');
process.env.GOOGLE_SHEET_ID = 'test-sheet-id';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.BOOKING_ALERT_TO = 'hello@mohormedia.com';
process.env.BOOKING_ALERT_FROM = 'site@mohormedia.com';

let calls = [];
globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (String(url).includes('oauth2.googleapis.com')) {
    return new Response(JSON.stringify({ access_token: 'stub-token' }), { status: 200 });
  }
  if (String(url).includes('sheets.googleapis.com')) {
    return new Response(JSON.stringify({ updates: { updatedRows: 1 } }), { status: 200 });
  }
  if (String(url).includes('api.resend.com')) {
    return new Response(JSON.stringify({ id: 'stub-email' }), { status: 200 });
  }
  throw new Error(`Unexpected fetch to ${url}`);
};

const { default: handler } = await import('../api/book.js');

function mockRes() {
  const res = { statusCode: 0, body: null, headers: {} };
  res.setHeader = (k, v) => {
    res.headers[k] = v;
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

async function run(body, { method = 'POST' } = {}) {
  calls = [];
  const req = { method, body, headers: { referer: 'https://mohormedia.com/' } };
  const res = mockRes();
  await handler(req, res);
  return res;
}

const valid = { name: 'Asha Rao', email: 'asha@example.com', brief: 'Rebrand', elapsedMs: 9000 };
let passed = 0;
const check = (label, fn) => {
  fn();
  console.log(`  ✓ ${label}`);
  passed += 1;
};

console.log('\n/api/book');

// --- guards ---------------------------------------------------------------
let res = await run(valid, { method: 'GET' });
check('rejects non-POST with 405', () => {
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'POST');
});

res = await run({ ...valid, company: 'spam co' });
check('honeypot: 200, but nothing written', () => {
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 0);
});

res = await run({ ...valid, elapsedMs: 300 });
check('too-fast submit: 200, but nothing written', () => {
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 0);
});

res = await run({ ...valid, name: '   ' });
check('missing name rejected', () => {
  assert.equal(res.statusCode, 400);
  assert.equal(calls.length, 0);
});

for (const bad of ['not-an-email', 'a@b', 'a b@c.com', '']) {
  res = await run({ ...valid, email: bad });
  check(`invalid email rejected: ${JSON.stringify(bad)}`, () => {
    assert.equal(res.statusCode, 400);
    assert.equal(calls.length, 0);
  });
}

res = await run(null);
check('unparseable body rejected', () => assert.equal(res.statusCode, 400));

// --- happy path -----------------------------------------------------------
res = await run(valid);
check('valid submission returns ok', () => {
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
});

const tokenCall = calls.find((c) => c.url.includes('oauth2'));
check('signs a JWT the public key verifies', () => {
  const assertion = new URLSearchParams(tokenCall.options.body).get('assertion');
  const [header, claim, signature] = assertion.split('.');
  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${header}.${claim}`);
  const sig = Buffer.from(signature.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  assert.ok(verifier.verify(publicKey, sig), 'signature did not verify');

  const decoded = JSON.parse(Buffer.from(claim, 'base64').toString());
  assert.equal(decoded.iss, process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  assert.equal(decoded.scope, 'https://www.googleapis.com/auth/spreadsheets');
  assert.ok(decoded.exp > decoded.iat, 'token expiry not after issue');
});

const sheetCall = calls.find((c) => c.url.includes('sheets.googleapis.com'));
check('appends the row in column order', () => {
  assert.ok(sheetCall.url.includes('test-sheet-id'));
  assert.ok(sheetCall.url.includes('valueInputOption=USER_ENTERED'));
  const [row] = JSON.parse(sheetCall.options.body).values;
  assert.equal(row.length, 5);
  assert.ok(!Number.isNaN(Date.parse(row[0])), 'timestamp not ISO');
  assert.equal(row[1], 'Asha Rao');
  assert.equal(row[2], 'asha@example.com');
  assert.equal(row[3], 'Rebrand');
  assert.equal(row[4], 'https://mohormedia.com/');
});

check('sends the alert with reply-to set to the prospect', () => {
  const mail = calls.find((c) => c.url.includes('resend.com'));
  const payload = JSON.parse(mail.options.body);
  assert.equal(payload.reply_to, 'asha@example.com');
  assert.deepEqual(payload.to, ['hello@mohormedia.com']);
  assert.ok(payload.subject.includes('Asha Rao'));
});

res = await run({ ...valid, name: 'Asha <script>alert(1)</script>' });
check('alert body escapes injected markup', () => {
  const mail = calls.find((c) => c.url.includes('resend.com'));
  const payload = JSON.parse(mail.options.body);
  assert.ok(!payload.html.includes('<script>'), 'raw script tag reached the email');
  assert.ok(payload.html.includes('&lt;script&gt;'));
});

// --- resilience -----------------------------------------------------------
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  if (String(url).includes('resend.com')) throw new Error('resend down');
  return realFetch(url, options);
};
res = await run(valid);
check('a failed email alert does not fail the booking', () => {
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
});

globalThis.fetch = async (url, options) => {
  if (String(url).includes('sheets.googleapis.com')) {
    return new Response('quota exceeded', { status: 429 });
  }
  return realFetch(url, options);
};
res = await run(valid);
check('a failed sheet write returns an error, not a false success', () => {
  assert.equal(res.statusCode, 502);
  assert.ok(res.body.error);
  assert.ok(!res.body.error.includes('quota'), 'internal detail leaked to the client');
});

globalThis.fetch = realFetch;
res = await run(undefined);
check('a body that is neither object nor stream returns 400, not a crash', () => {
  assert.equal(res.statusCode, 400);
  assert.ok(res.body.error);
});

console.log(`\n${passed} checks passed\n`);
