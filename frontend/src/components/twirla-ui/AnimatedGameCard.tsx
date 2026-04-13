import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import './AnimatedGameCard.css';

interface AnimatedGameCardProps {
  to: string;
  className?: string;
  featured?: boolean;
  children: ReactNode;
}

export default function AnimatedGameCard({ to, className = '', featured, children }: AnimatedGameCardProps) {
  const reduceMotion = useReducedMotion();
  const linkClass = [className, featured && !reduceMotion ? 'tw-anim-game-card-link--float' : ''].filter(Boolean).join(' ');

  return (
    <motion.div
      className="tw-anim-game-card"
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: 'tween', duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={to} className={linkClass}>
        {children}
      </Link>
    </motion.div>
  );
}
