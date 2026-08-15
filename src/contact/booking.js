// Client-side booking config — kept in sync with api/book.js
export const TZ = 'Asia/Kolkata'
// 15-min slots from 10:00 up to (but not incl) midnight → last slot 23:45.
function makeSlots(startH = 10, endExclH = 24, stepMin = 15) {
  const out = []
  for (let m = startH * 60; m < endExclH * 60; m += stepMin) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return out
}
export const SLOTS = makeSlots(10, 24, 15)
export const HORIZON_DAYS = 14

export function istToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export function upcomingDays() {
  const base = new Date(`${istToday()}T00:00:00+05:30`)
  const out = []
  for (let i = 0; i <= HORIZON_DAYS; i++) {
    const d = new Date(base.getTime())
    d.setUTCDate(d.getUTCDate() + i)
    const value = new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(d)
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short',
    }).formatToParts(d)
    const get = (t) => parts.find((p) => p.type === t)?.value || ''
    out.push({ value, dow: get('weekday'), day: get('day'), month: get('month'), isToday: i === 0 })
  }
  return out
}

function istInstant(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00+05:30`)
}

export function slotIsFuture(dateStr, timeStr) {
  return istInstant(dateStr, timeStr).getTime() > Date.now()
}

export function slotLabel(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = ((h + 11) % 12) + 1
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`
}
