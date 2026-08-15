import { useState } from 'react';
import logo, { logoIsSquare } from '../assets/logo';
import { useBooking } from '../BookingContext';
import { nav } from '../data/content';
import { useScrollY } from '../hooks/useScrollY';
import './Nav.css';

export default function Nav() {
  const scrollY = useScrollY();
  const [open, setOpen] = useState(false);
  const { openBooking } = useBooking();

  return (
    <header className={`mm-nav${scrollY > 24 ? ' is-stuck' : ''}`}>
      <div className="mm-nav__inner mm-shell">
        <a className="mm-nav__brand" href="#mm-top" onClick={() => setOpen(false)}>
          <img src={logo} alt="" className={logoIsSquare ? 'mm-mark--round' : 'mm-mark--free'} />
          <span>
            Mohor <span className="mm-nav__brand-accent">Media</span>
          </span>
        </a>

        <button
          type="button"
          className="mm-nav__toggle"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>

        <div className={`mm-nav__menu${open ? ' is-open' : ''}`}>
          <nav className="mm-nav__links" aria-label="Primary">
            {nav.map((item) => (
              <a key={item.href + item.label} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>
          <a
            className="mm-btn mm-btn--saffron mm-nav__cta"
            href="#mm-book"
            onClick={() => {
              setOpen(false);
              openBooking();
            }}
          >
            <span className="mm-nav__cta-spark" aria-hidden="true">
              ✦
            </span>
            <span className="mm-nav__cta-label">Book a Free Call</span>
            <span className="mm-nav__cta-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
