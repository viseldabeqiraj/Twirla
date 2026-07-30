import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Confetti from './Confetti';
import { fireWinFeedback } from '../utils/winFeedback';
import './RewardCelebration.css';

interface RewardCelebrationProps {
  children: ReactNode;
  className?: string;
  /** Confetti particle count; ignored when celebrate is false */
  confettiCount?: number;
  /** When false, no confetti — shows a loss mood instead (wheel miss, game lost, etc.) */
  celebrate?: boolean;
}

/** Wraps reward / result UI so confetti always layers above the card content. */
export default function RewardCelebration({
  children,
  className,
  confettiCount = 150,
  celebrate = true,
}: RewardCelebrationProps) {
  const rootClass = [
    'reward-celebration',
    celebrate ? '' : 'reward-celebration--loss',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    if (celebrate) fireWinFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={rootClass}>
      {!celebrate ? (
        <div className="reward-celebration-mood" aria-hidden>
          <span className="reward-celebration-mood-emoji">😢</span>
        </div>
      ) : null}
      {children}
      {celebrate && confettiCount > 0 ? <Confetti count={confettiCount} /> : null}
    </div>
  );
}
