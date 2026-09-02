import { useEffect, useRef, useState } from 'react';
import { useBooking } from '../BookingContext';
import { bookPoints } from '../data/content';
import { useReveal, revealClass } from '../hooks/useReveal';
import './BookCall.css';

const EMPTY = { name: '', email: '', brief: '', company: '' };

export default function BookCall() {
  const { open, openBooking, closeBooking } = useBooking();
  // idle | sending | sent | error
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [ref, seen] = useReveal();
  const firstFieldRef = useRef(null);
  const openedAt = useRef(0);

  const sent = status === 'sent';

  // Land the visitor in the form when it opens — especially when they arrived
  // straight from the nav and the panel animated in beneath them.
  useEffect(() => {
    if (!open) return undefined;
    // Start the clock the API checks against, to catch scripted submissions.
    openedAt.current = Date.now();
    const timer = window.setTimeout(
      () => firstFieldRef.current?.focus({ preventScroll: true }),
      450,
    );
    return () => window.clearTimeout(timer);
  }, [open]);

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (status === 'error') setStatus('idle');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending' || status === 'sent') return;

    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, elapsedMs: Date.now() - openedAt.current }),
      });
      const payload = await response.json().catch(() => null);

      // Success requires an explicit { ok: true }. A 200 carrying anything else
      // means the request never reached the function — most likely the SPA
      // catch-all rewrite served index.html — and reporting "Thanks" for a
      // booking that was never stored is the worst outcome here.
      if (!response.ok || !payload?.ok) {
        setError(payload?.error || 'Something went wrong. Please email us instead.');
        setStatus('error');
        return;
      }

      setStatus('sent');
    } catch {
      // Offline, blocked, or the deploy is mid-rollout.
      setError('Could not reach us just now. Please email hello@mohormedia.com.');
      setStatus('error');
    }
  };

  const close = () => {
    closeBooking();
    setStatus('idle');
    setError('');
    setForm(EMPTY);
  };

  return (
    <section id="mm-book" className={`mm-book${open ? ' is-open' : ''}`} aria-label="Book a call">
      <svg className="mm-book__sprig mm-book__sprig--left" width="240" height="360" viewBox="0 0 120 180" aria-hidden="true">
        <path d="M60 175C60 120 40 90 22 70" fill="none" stroke="#8c5a18" strokeWidth="2" />
        <path d="M40 120c-14-6-26 2-24 12 12 4 22-3 24-12Z" fill="#b87524" />
        <circle cx="22" cy="66" r="9" fill="none" stroke="#8c5a18" strokeWidth="2" />
        <path d="M22 48c6 0 10 6 8 12-6 1-10-5-8-12Z" fill="#b87524" />
        <path d="M4 62c4-5 12-4 16 2-5 4-13 3-16-2Z" fill="#b87524" />
      </svg>
      <svg className="mm-book__sprig mm-book__sprig--right" width="200" height="320" viewBox="0 0 120 180" aria-hidden="true">
        <path d="M60 5C60 60 76 96 96 130" fill="none" stroke="#8c5a18" strokeWidth="2" />
        <path d="M78 70c14 6 26-2 24-12-12-4-22 3-24 12Z" fill="#b87524" />
        <circle cx="60" cy="10" r="8" fill="none" stroke="#8c5a18" strokeWidth="2" />
      </svg>

      <div className="mm-book__inner mm-shell">
        <div ref={ref} className={revealClass(seen, 'mm-book__copy')}>
          <h2 className="mm-book__title">
            Your brand deserves to <span className="mm-book__bloom">bloom.</span>
          </h2>
          <p className="mm-book__lede">
            Book a free 30-minute call. We&apos;ll audit your brand, share three ideas you can steal
            — whether or not we ever work together.
          </p>

          <ul className="mm-book__points">
            {bookPoints.map((point) => (
              <li key={point}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3a4526" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m8 12 3 3 5-6" />
                </svg>
                {point}
              </li>
            ))}
          </ul>

          <div className="mm-book__cta-wrap">
            <button type="button" className="mm-book__cta" onClick={openBooking}>
              Claim My Free Call <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        <div className="mm-book__panel-slot">
          <form className="mm-book__panel" onSubmit={onSubmit} aria-hidden={open ? undefined : true}>
            <div className="mm-book__panel-head">
              <div>
                <div className="mm-book__panel-title">Book your free call</div>
                <div className="mm-book__panel-sub">Thirty minutes. Zero obligation.</div>
              </div>
              <button type="button" className="mm-book__close" onClick={close} aria-label="Close form" tabIndex={open ? 0 : -1}>
                ×
              </button>
            </div>

            <input
              ref={firstFieldRef}
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={update('name')}
              tabIndex={open ? 0 : -1}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Work email"
              value={form.email}
              onChange={update('email')}
              tabIndex={open ? 0 : -1}
              required
            />
            <textarea
              name="brief"
              rows={3}
              placeholder="Tell us about your brand (optional)"
              value={form.brief}
              onChange={update('brief')}
              tabIndex={open ? 0 : -1}
            />

            {/* Honeypot. Hidden from sight and from assistive tech, and taken
                out of the tab order, so only a script fills it in. */}
            <div className="mm-book__trap" aria-hidden="true">
              <label htmlFor="mm-company">Company (leave this empty)</label>
              <input
                id="mm-company"
                type="text"
                name="company"
                value={form.company}
                onChange={update('company')}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="mm-book__submit"
              tabIndex={open ? 0 : -1}
              disabled={status === 'sending' || sent}
            >
              {status === 'sending'
                ? 'Sending…'
                : sent
                  ? "Thanks — we'll reply within a day"
                  : 'Submit'}{' '}
              <span aria-hidden="true">{status === 'sending' ? '·' : '↗'}</span>
            </button>

            {/* aria-live so the outcome is announced, not just shown. */}
            <p
              className={`mm-book__status${error ? ' is-error' : ''}`}
              role="status"
              aria-live="polite"
            >
              {error || (sent ? "Got it — we'll be in touch within one working day." : '')}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
