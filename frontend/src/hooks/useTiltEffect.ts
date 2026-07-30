import { useEffect, useRef } from 'react';
import { usePrefersFineHover, usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Subtle cursor-follow 3D tilt on hover — attach the returned ref to the
 * element that should tilt. Desktop-only (fine pointer + hover) and inert
 * under prefers-reduced-motion. Mutates style.transform imperatively rather
 * than via React state, since mousemove fires far too often for re-renders.
 */
export function useTiltEffect<T extends HTMLElement>(maxDeg = 6) {
  const ref = useRef<T>(null);
  const fineHover = usePrefersFineHover();
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !fineHover || reduceMotion) return;

    let leaveTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transition = '';
      el.style.transform = `perspective(900px) rotateY(${(px * maxDeg).toFixed(2)}deg) rotateX(${(-py * maxDeg).toFixed(2)}deg)`;
    };

    const handleLeave = () => {
      el.style.transition = 'transform 0.4s ease';
      el.style.transform = '';
      leaveTimeout = setTimeout(() => {
        el.style.transition = '';
      }, 400);
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      if (leaveTimeout) clearTimeout(leaveTimeout);
      el.style.transform = '';
      el.style.transition = '';
    };
  }, [fineHover, reduceMotion, maxDeg]);

  return ref;
}
