import React, { useRef } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
import { usePrefersFineHover } from '../../hooks/usePrefersReducedMotion';
import './PrimaryButton.css';
import './AnimatedPrimaryButton.css';

export interface AnimatedPrimaryButtonProps {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  className?: string;
  variant?: 'solid' | 'secondary' | 'ghost';
  block?: boolean;
  pulse?: boolean;
  small?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  'aria-label'?: string;
  /** Cursor-follow pull on hover (desktop only, respects reduced-motion). Default false. */
  magnetic?: boolean;
}

export default function AnimatedPrimaryButton({
  children,
  href,
  external,
  className = '',
  variant = 'solid',
  block,
  pulse,
  small,
  type = 'button',
  disabled,
  onClick,
  'aria-label': ariaLabel,
  magnetic = false,
}: AnimatedPrimaryButtonProps) {
  const reduceMotion = useReducedMotion();
  const fineHover = usePrefersFineHover();
  const magneticRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  const springX = useSpring(magneticX, { stiffness: 300, damping: 20, mass: 0.4 });
  const springY = useSpring(magneticY, { stiffness: 300, damping: 20, mass: 0.4 });
  const isMagnetic = magnetic && fineHover && !reduceMotion;

  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (!isMagnetic) return;
    const el = magneticRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    magneticX.set((e.clientX - (rect.left + rect.width / 2)) * 0.3);
    magneticY.set((e.clientY - (rect.top + rect.height / 2)) * 0.3);
  };

  const handleMagneticLeave = () => {
    if (!isMagnetic) return;
    magneticX.set(0);
    magneticY.set(0);
  };

  const v =
    variant === 'secondary' ? 'tw-primary-btn--secondary' : variant === 'ghost' ? 'tw-primary-btn--ghost' : '';
  const cls = [
    'tw-anim-btn',
    'tw-primary-btn',
    v,
    block ? 'tw-primary-btn--block' : '',
    pulse && !reduceMotion ? 'tw-anim-btn--glow-pulse' : '',
    small ? 'tw-primary-btn--sm' : '',
    reduceMotion ? 'tw-anim-disable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const tapScale = reduceMotion ? 1 : 0.97;
  // When magnetic, the spring-driven x/y already gives hover its own motion —
  // skip the separate y-lift so the two don't fight over the same transform.
  const hover =
    fineHover && !reduceMotion
      ? isMagnetic
        ? { scale: 1.01, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }
        : { y: -2, scale: 1.01, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }
      : {};

  const transition = {
    type: 'tween' as const,
    duration: reduceMotion ? 0 : 0.18,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };

  const magneticProps = isMagnetic
    ? {
        style: { x: springX, y: springY },
        onMouseMove: handleMagneticMove,
        onMouseLeave: handleMagneticLeave,
      }
    : {};

  if (href) {
    return (
      <motion.a
        ref={magneticRef}
        href={href}
        className={cls}
        whileTap={{ scale: tapScale }}
        whileHover={hover}
        transition={transition}
        onClick={onClick}
        aria-label={ariaLabel}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...magneticProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={magneticRef}
      type={type}
      className={cls}
      disabled={disabled}
      whileTap={{ scale: tapScale }}
      whileHover={hover}
      transition={transition}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      aria-label={ariaLabel}
      {...magneticProps}
    >
      {children}
    </motion.button>
  );
}
