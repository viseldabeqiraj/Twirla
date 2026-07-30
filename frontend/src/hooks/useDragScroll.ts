import { useEffect, useRef } from 'react';

/**
 * Lets desktop mouse users grab-and-drag a horizontally-scrolling row.
 * Touch already scrolls these rows natively; this just adds the same
 * affordance for a mouse. No-ops (and leaves the cursor alone) when the row
 * doesn't actually overflow.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.scrollWidth <= el.clientWidth + 4) return;

    el.style.cursor = 'grab';
    let down = false;
    let moved = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!down) return;
      if (Math.abs(e.clientX - startX) > 3) moved = true;
      el.scrollLeft = startScrollLeft - (e.clientX - startX);
    };
    const end = () => {
      down = false;
      el.style.cursor = 'grab';
    };
    // Swallow the click that follows a drag so it doesn't accidentally
    // activate a link/button under the cursor.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointerleave', end);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', end);
      el.removeEventListener('pointerleave', end);
      el.removeEventListener('click', onClickCapture, true);
      el.style.cursor = '';
    };
  }, []);

  return ref;
}
