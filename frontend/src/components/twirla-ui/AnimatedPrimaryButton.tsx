import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
}: AnimatedPrimaryButtonProps) {
  const reduceMotion = useReducedMotion();
  const fineHover = usePrefersFineHover();

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
  const hover =
    fineHover && !reduceMotion
      ? { y: -2, scale: 1.01, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }
      : {};

  const transition = {
    type: 'tween' as const,
    duration: reduceMotion ? 0 : 0.18,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };

  if (href) {
    return (
      <motion.a
        href={href}
        className={cls}
        whileTap={{ scale: tapScale }}
        whileHover={hover}
        transition={transition}
        onClick={onClick}
        aria-label={ariaLabel}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      className={cls}
      disabled={disabled}
      whileTap={{ scale: tapScale }}
      whileHover={hover}
      transition={transition}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
}
