import { useEffect, useMemo, useRef, useState } from 'react'
import { SLOTS, upcomingDays, slotIsFuture, slotLabel } from './booking.js'

export default function BookingModal({ open, onClose }) {
  const days = useMemo(() => upcomingDays(), [])
  const [date, setDate] = useState(days[0]?.value || '')
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const dialogRef = useRef(null)

  useEffect(() => {
    if (open) {
      setDate(days[0]?.value || '')
      setTime('')
      setStatus('idle')
      setResult(null)
      setError('')
    }
    // name/email/phone persist across reopen on purpose
  }, [open, days])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])

  if (!open) return null

  const slotsForDay = SLOTS.map((t) => ({ t, disabled: !slotIsFuture(date, t) }))
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const phoneOk = /^\+?\d{7,15}$/.test(phone.replace(/[\s()\-.]/g, ''))
  const canSubmit = date && time && emailOk && phoneOk && status !== 'sending'

  async function submit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('sending')
    setError('')
    try {
      const r = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, date, time }),
      })
      const data = await r.json()
      if (!r.ok || !data.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setResult(data)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Book a 15-minute call" ref={dialogRef}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        {status === 'done' ? (
          <div className="book-done">
            <div className="book-tick" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className="modal-title">You're booked</h2>
            <p className="book-when">{result.whenStr}</p>
            <p className="book-note">A Google Calendar invite + confirmation email are on their way{email ? ` to ${email}` : ''}.</p>
            <a className="book-meet" href={result.meetLink} target="_blank" rel="noopener noreferrer">Open Google Meet link</a>
            <button className="book-secondary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="book-form" onSubmit={submit}>
            <h2 className="modal-title">Book a 15-minute call</h2>
            <p className="modal-sub">All times IST (10:00 AM – 12:00 AM)</p>

            <div className="field">
              <label className="field-label">Date</label>
              <div className="chip-row" role="listbox" aria-label="Choose a date">
                {days.map((d) => (
                  <button type="button" key={d.value} className={`chip chip-day${date === d.value ? ' chip--on' : ''}`} aria-selected={date === d.value} onClick={() => { setDate(d.value); setTime('') }}>
                    <span className="chip-dow">{d.isToday ? 'Today' : d.dow}</span>
                    <span className="chip-date">{d.day} {d.month}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">Time</label>
              <div className="slot-grid">
                {slotsForDay.map(({ t, disabled }) => (
                  <button type="button" key={t} disabled={disabled} className={`chip chip-slot${time === t ? ' chip--on' : ''}`} aria-selected={time === t} onClick={() => setTime(t)}>
                    {slotLabel(t)}
                  </button>
                ))}
              </div>
              {slotsForDay.every((s) => s.disabled) && <p className="field-hint">No slots left today — pick another date.</p>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="bk-name">Name <span className="opt">(optional)</span></label>
              <input id="bk-name" className="input" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="bk-email">Email</label>
              <input id="bk-email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="bk-phone">Phone</label>
              <input id="bk-phone" className="input" type="tel" required autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>

            {status === 'error' && <p className="book-error">{error}</p>}

            <button className="book-submit" type="submit" disabled={!canSubmit}>
              {status === 'sending' ? 'Booking…' : 'Confirm booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
