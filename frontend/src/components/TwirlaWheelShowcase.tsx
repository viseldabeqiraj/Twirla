import { useCallback, useState } from 'react';
import PrizeWheel from './PrizeWheel';
import './TwirlaWheelShowcase.css';

const LABELS = ['5%', '10%', '15%', '20%', 'DHURATË', '30%'];
/* Segment colors use the shop brand palette; the gold rim + glow are the static premium frame. */
const COLORS = ['#db2777', '#7b5cff', '#e11d74', '#8a25c9', '#ff2e9a', '#b3138a'];

/**
 * Landing wheel showcase — now a thin wrapper over the reusable <PrizeWheel/>.
 * Tap to spin; confetti + win text on settle.
 */
export default function TwirlaWheelShowcase() {
  const [win, setWin] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const handleSpinStart = useCallback(() => {
    setWin(null);
    setSpinning(true);
    return true;
  }, []);

  const handleSettled = useCallback((idx: number) => {
    setSpinning(false);
    setWin(LABELS[idx] ?? null);
  }, []);

  return (
    <div className="twx-wheel-wrap">
      <PrizeWheel
        labels={LABELS}
        colors={COLORS}
        interactive="drag"
        confettiOnWin
        onSpinStart={handleSpinStart}
        onSettled={handleSettled}
        ariaLabel="Rrotullo rrotën"
      />
      <p className={`twx-wheel-hint ${win ? 'twx-wheel-hint--win' : ''}`}>
        {spinning
          ? '🎡 Duke u rrotulluar…'
          : win
            ? `🎉 Fitove ${win}!`
            : '👆 Tërhiq rrotën për ta rrotulluar'}
      </p>
    </div>
  );
}
