import { useEffect, useRef } from 'react';

/**
 * Click-and-drag horizontal scrolling for the featured-work strip.
 * Returns the ref to attach, plus a `wasDragged` check so a drag that ends over
 * a card does not also read as a click on it.
 */
export function useDragScroll({ speed = 1.2 } = {}) {
  const ref = useRef(null);
  const draggedRef = useRef(false);

  useEffect(() => {
    const strip = ref.current;
    if (!strip) return undefined;

    let down = false;
    let startX = 0;
    let startLeft = 0;

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      down = true;
      draggedRef.current = false;
      startX = e.pageX;
      startLeft = strip.scrollLeft;
      strip.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
      if (!down) return;
      const delta = e.pageX - startX;
      if (Math.abs(delta) > 6) draggedRef.current = true;
      e.preventDefault();
      strip.scrollLeft = startLeft - delta * speed;
    };

    const onPointerUp = () => {
      down = false;
      strip.style.cursor = 'grab';
    };

    strip.addEventListener('mousedown', onPointerDown);
    strip.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    return () => {
      strip.removeEventListener('mousedown', onPointerDown);
      strip.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
    };
  }, [speed]);

  return { ref, wasDragged: () => draggedRef.current };
}
