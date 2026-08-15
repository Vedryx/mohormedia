import { useEffect, useState } from 'react';

/** Current vertical scroll offset, sampled passively via rAF. */
export function useScrollY() {
  const [y, setY] = useState(0);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setY(window.scrollY || document.documentElement.scrollTop || 0);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return y;
}
