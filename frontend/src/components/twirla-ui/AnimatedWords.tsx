import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedWordsProps {
  /** Text to split into words and stagger-reveal. Include trailing punctuation. */
  text: string;
  className?: string;
  /** Stagger start delay in seconds — chain multiple chunks so they read as one reveal. */
  delayOffset?: number;
  /** Seconds between each word's start. */
  wordDelay?: number;
}

/**
 * Word-by-word entrance reveal (fade + rise), the "premium" text-in-motion
 * pattern seen on award-winning marketing sites. Falls back to plain static
 * text when the user prefers reduced motion.
 */
export default function AnimatedWords({
  text,
  className,
  delayOffset = 0,
  wordDelay = 0.055,
}: AnimatedWordsProps) {
  const reduceMotion = useReducedMotion();
  const words = text.split(' ');

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <motion.span
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
              delay: delayOffset + i * wordDelay,
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

/** Total seconds a chunk of `wordCount` words takes to finish staggering in — use to chain the next chunk's delayOffset. */
export function wordsDuration(wordCount: number, wordDelay = 0.055): number {
  return wordCount * wordDelay;
}
