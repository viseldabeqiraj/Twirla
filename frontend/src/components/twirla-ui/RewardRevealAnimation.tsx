import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import SoftSparkles from './SoftSparkles';
import './RewardRevealAnimation.css';

interface RewardRevealAnimationProps {
  children: React.ReactNode;
  /** Minimal sparkles behind card */
  sparkles?: boolean;
  className?: string;
}

export default function RewardRevealAnimation({
  children,
  sparkles = true,
  className = '',
}: RewardRevealAnimationProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`tw-reward-reveal ${className}`.trim()}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {sparkles ? <SoftSparkles /> : null}
      <div className="tw-reward-reveal__content">{children}</div>
    </motion.div>
  );
}
