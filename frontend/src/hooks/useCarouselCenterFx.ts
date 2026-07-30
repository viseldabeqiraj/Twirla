import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Center-scale + subtle image parallax for a horizontally-scrolling row of
 * cards — the card nearest the row's center gently scales up while others
 * dim and shrink slightly, ported from the shop demo's product carousel.
 * No-ops when the row doesn't actually overflow (e.g. a desktop grid layout
 * that wraps instead of scrolling) or under prefers-reduced-motion.
 */
export function useCarouselCenterFx<T extends HTMLElement>(cardSelector: string, imageSelector?: string) {
  const ref = useRef<T>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    if (el.scrollWidth <= el.clientWidth + 4) return; // not actually a scroller (e.g. desktop grid)

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      el.querySelectorAll<HTMLElement>(cardSelector).forEach((card) => {
        const cr = card.getBoundingClientRect();
        const cc = cr.left + cr.width / 2;
        const dist = cx - cc;
        const t = Math.max(0, 1 - Math.abs(dist) / (rect.width * 0.7));
        card.style.transform = `scale(${(0.94 + 0.06 * t).toFixed(3)})`;
        card.style.opacity = (0.75 + 0.25 * t).toFixed(2);
        if (imageSelector) {
          const img = card.querySelector<HTMLElement>(imageSelector);
          if (img) img.style.transform = `translateX(${(dist * 0.04).toFixed(1)}px)`;
        }
      });
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const initial = setTimeout(update, 80);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      clearTimeout(initial);
      if (rafId) cancelAnimationFrame(rafId);
      el.querySelectorAll<HTMLElement>(cardSelector).forEach((card) => {
        card.style.transform = '';
        card.style.opacity = '';
        if (imageSelector) {
          const img = card.querySelector<HTMLElement>(imageSelector);
          if (img) img.style.transform = '';
        }
      });
    };
  }, [cardSelector, imageSelector, reduceMotion]);

  return ref;
}
