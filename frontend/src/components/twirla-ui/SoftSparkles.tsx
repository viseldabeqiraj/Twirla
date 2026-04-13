import type { CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import './SoftSparkles.css';

const COUNT = 6;

interface SoftSparklesProps {
  className?: string;
}

/** Very light decorative sparkles — transform/opacity only. */
export default function SoftSparkles({ className = '' }: SoftSparklesProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className={`tw-soft-sparkles ${className}`} aria-hidden>
      {Array.from({ length: COUNT }).map((_, i) => (
        <span key={i} className="tw-soft-sparkles__dot" style={{ '--tw-sparkle-i': String(i) } as CSSProperties} />
      ))}
    </div>
  );
}
