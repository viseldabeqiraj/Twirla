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
 */
export default function Confetti({ count = 150 }: ConfettiProps) {
  useEffect(() => {
    // Keep bursts generous so the effect reads as celebratory, even when
    // callers pass a small legacy count.
    fireConfetti({ count: Math.max(count, 140) });
  }, [count]);

  return null;
}
