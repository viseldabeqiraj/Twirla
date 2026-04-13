import type { CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import './AnimatedBackground.css';

interface AnimatedBackgroundProps {
  /** Brand-aligned tones (shop or Twirla defaults) */
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Low-density blurred orbs behind landing content. Pointer-events none.
 */
export default function AnimatedBackground({
  primaryColor = '#db2777',
  secondaryColor = '#be185d',
}: AnimatedBackgroundProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`tw-animated-bg ${reduceMotion ? 'tw-animated-bg--static' : ''}`}
      aria-hidden
      style={
        {
          '--tw-bg-anim-a': primaryColor,
          '--tw-bg-anim-b': secondaryColor,
        } as CSSProperties
      }
    >
      <span className="tw-animated-bg__orb tw-animated-bg__orb--1" />
      <span className="tw-animated-bg__orb tw-animated-bg__orb--2" />
      <span className="tw-animated-bg__orb tw-animated-bg__orb--3" />
    </div>
  );
}
