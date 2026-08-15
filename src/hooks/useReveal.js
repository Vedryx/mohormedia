import { useEffect, useRef, useState } from 'react';

/**
 * Fade-and-lift an element in once it scrolls into view.
 *
 * Anything already above the fold on mount is shown immediately so nothing
 * flashes, and a safety timer guarantees content is never left hidden if the
 * observer never fires.
 */
export function useReveal({ threshold = 0.08, rootMargin = '0px 0px -12% 0px' } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    // Already on screen at mount — skip the animation entirely.
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.92) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setVisible(true);
          observer.unobserve(entry.target);
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    const safety = window.setTimeout(() => setVisible(true), 9000);

    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, [threshold, rootMargin]);

  return [ref, visible];
}

/** Convenience: the class string a revealed element should carry. */
export function revealClass(visible, extra = '') {
  return ['mm-reveal', visible ? 'is-visible' : '', extra].filter(Boolean).join(' ');
}
