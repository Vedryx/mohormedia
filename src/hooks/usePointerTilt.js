import { useCallback, useEffect, useRef } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Tilts an element in 3D toward the pointer.
 *
 * Writes CSS custom properties rather than a transform string, so the stylesheet
 * stays in charge of how the tilt is composed — the card, its backing plate and
 * the glare each read the same numbers and move by different amounts, which is
 * what sells the depth.
 *
 * --mm-rx / --mm-ry  rotation in degrees
 * --mm-gx / --mm-gy  glare position, 0–100%
 * --mm-tilt          0 at rest, 1 while pointing — for lifting shadows
 */
export function usePointerTilt({ max = 11 } = {}) {
  const ref = useRef(null);
  const frame = useRef(0);

  const set = useCallback((rx, ry, gx, gy, active) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--mm-rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--mm-ry', `${ry.toFixed(2)}deg`);
    el.style.setProperty('--mm-gx', `${gx.toFixed(1)}%`);
    el.style.setProperty('--mm-gy', `${gy.toFixed(1)}%`);
    el.style.setProperty('--mm-tilt', String(active));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    let latest = null;

    // Cancel-and-reschedule rather than "skip while a frame is pending": the
    // skip form wedges permanently if a scheduled frame never runs (a throttled
    // or hidden page), and it also reads a stale pointer position.
    const onMove = (event) => {
      latest = { x: event.clientX, y: event.clientY };
      window.cancelAnimationFrame(frame.current);
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        if (!latest) return;
        const rect = el.getBoundingClientRect();
        // -0.5 … 0.5 from the element's centre
        const px = (latest.x - rect.left) / rect.width - 0.5;
        const py = (latest.y - rect.top) / rect.height - 0.5;
        // Pointing right tips the right edge away, so rotateY follows +x;
        // pointing down tips the bottom away, so rotateX follows -y.
        set(-py * max * 2, px * max * 2, (px + 0.5) * 100, (py + 0.5) * 100, 1);
      });
    };

    const onLeave = () => {
      latest = null;
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
      set(0, 0, 50, 50, 0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    onLeave();

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      window.cancelAnimationFrame(frame.current);
    };
  }, [max, set]);

  return ref;
}
