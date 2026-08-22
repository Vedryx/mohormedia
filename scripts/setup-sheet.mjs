/**
 * Seeds the booking sheet's header row so the columns match what /api/book
 * writes. Safe to re-run — it overwrites row 1 rather than appending.
 *
 *   npm run setup:sheet
 */
import { readFileSync } from 'node:fs';
import { COLUMNS, updateRange } from '../lib/google-sheets.js';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].replace(/^"|"$/g, '');
}

const sheet = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
const lastColumn = String.fromCharCode(64 + COLUMNS.length);

await updateRange({
  spreadsheetId: process.env.GOOGLE_SHEET_ID,
  range: `${sheet}!A1:${lastColumn}1`,
  values: [COLUMNS],
});

console.log(`Header row set on ${sheet}: ${COLUMNS.join(' | ')}`);
