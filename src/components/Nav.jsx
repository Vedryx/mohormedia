import { useCallback, useRef, useState } from 'react';
import logo, { logoIsSquare } from '../assets/logo';
import { useBooking } from '../BookingContext';
import { nav } from '../data/content';
import { useScrollY } from '../hooks/useScrollY';
import './Nav.css';

const MIN_SCROLL_MS = 360;
const MAX_SCROLL_MS = 1600;
const PX_PER_MS = 2.4;

const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function getScrollTarget(target) {
  const navHeight = document.querySelector('.mm-nav')?.getBoundingClientRect().height || 0;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

  return Math.min(Math.max(targetTop, 0), Math.max(maxScroll, 0));
}

function setHash(hash) {
  if (!hash || window.location.hash === hash) return;

  const oldURL = window.location.href;
  window.history.pushState(null, '', hash);
  window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: window.location.href }));
}

function glideToTarget(target, animationFrameRef) {
  if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

  const startY = window.scrollY;
  const targetY = getScrollTarget(target);
  const distance = Math.abs(targetY - startY);

  if (distance < 1 || prefersReducedMotion()) {
    window.scrollTo(0, targetY);
    animationFrameRef.current = null;
    return;
  }

  const duration = Math.min(MAX_SCROLL_MS, Math.max(MIN_SCROLL_MS, distance / PX_PER_MS));
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + (targetY - startY) * eased);

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(step);
      return;
    }

    animationFrameRef.current = null;
  }

  animationFrameRef.current = requestAnimationFrame(step);
}

export default function Nav() {
  const scrollY = useScrollY();
  const [open, setOpen] = useState(false);
  const { openBooking } = useBooking();
  const animationFrameRef = useRef(null);

  const handleHashClick = useCallback((event, href, afterClick) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    setOpen(false);
    afterClick?.();

    const url = new URL(href, window.location.href);
    const samePage =
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search;

    if (!samePage || !url.hash) return;

    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    setHash(url.hash);
    requestAnimationFrame(() => glideToTarget(target, animationFrameRef));
  }, []);

  return (
    <header className={`mm-nav${scrollY > 24 ? ' is-stuck' : ''}`}>
      <div className="mm-nav__inner mm-shell">
        <a className="mm-nav__brand" href="#mm-top" onClick={(event) => handleHashClick(event, '#mm-top')}>
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
              <a
                key={item.href + item.label}
                href={item.href}
                onClick={(event) => handleHashClick(event, item.href)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            className="mm-btn mm-btn--saffron mm-nav__cta"
            href="#mm-book"
            onClick={(event) => handleHashClick(event, '#mm-book', openBooking)}
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
