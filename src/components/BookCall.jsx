import { useEffect, useRef, useState } from 'react';
import { useBooking } from '../BookingContext';
import { bookPoints } from '../data/content';
import { useReveal, revealClass } from '../hooks/useReveal';
import './BookCall.css';

const EMPTY = { name: '', email: '', brief: '' };

export default function BookCall() {
  const { open, openBooking, closeBooking } = useBooking();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [ref, seen] = useReveal();
  const firstFieldRef = useRef(null);

  // Land the visitor in the form when it opens — especially when they arrived
  // straight from the nav and the panel animated in beneath them.
  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(
      () => firstFieldRef.current?.focus({ preventScroll: true }),
      450,
    );
    return () => window.clearTimeout(timer);
  }, [open]);

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const onSubmit = (event) => {
    event.preventDefault();
    // No backend yet — see README for where to POST this.
    setSent(true);
  };

  const close = () => {
    closeBooking();
    setSent(false);
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

            <button type="submit" className="mm-book__submit" tabIndex={open ? 0 : -1}>
              {sent ? "Thanks — we'll reply within a day" : 'Submit'} <span aria-hidden="true">↗</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
