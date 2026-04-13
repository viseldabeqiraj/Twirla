import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './StaggeredEntrance.css';

interface StaggeredEntranceProps {
  /** Each entry is staggered in order */
  items: ReactNode[];
  className?: string;
  /** Delay between items (seconds) */
  stagger?: number;
}

export default function StaggeredEntrance({ items, className = '', stagger = 0.055 }: StaggeredEntranceProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`tw-staggered-entrance ${className}`.trim()}>
      {items.map((node, i) => (
        <motion.div
          key={i}
          className="tw-staggered-entrance__item"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { delay: i * stagger, duration: 0.32, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {node}
        </motion.div>
      ))}
    </div>
  );
}
