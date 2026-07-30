import { useEffect } from 'react';
import { fireConfetti } from '../utils/confetti';

interface ConfettiProps {
  /** Particle count for the burst. */
  count?: number;
}

/**
 * Fires the realistic confetti burst (shared canvas util, matching the Twirla
 * HTML prototype) once when mounted. Renders nothing itself — the util owns a
 * single full-screen canvas layered above the page.
 *
 * Params match the wheel's win burst exactly (150 particles, origin at 50%
 * viewport height) so every game — wheel, scratch, catch, runner, memory
 * match, countdown, mystery box — celebrates a win identically.
 */
export default function Confetti({ count = 150 }: ConfettiProps) {
  useEffect(() => {
    // Keep bursts generous so the effect reads as celebratory, even when
    // callers pass a small legacy count.
    fireConfetti({ count: Math.max(count, 150), originYRatio: 0.5 });
  }, [count]);

  return null;
}
