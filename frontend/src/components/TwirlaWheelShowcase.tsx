import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import './TwirlaWheelShowcase.css';

const LABELS = ['5%', '10%', '15%', '20%', 'DHURATË', '30%'];
/* Segment colors use the shop brand palette; the gold rim + glow are the static premium frame. */
const COLORS = ['#db2777', '#7b5cff', '#e11d74', '#8a25c9', '#ff2e9a', '#b3138a'];
const R = 100;
const N = LABELS.length;
const STEP = 360 / N;

function polar(r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [R + r * Math.cos(rad), R + r * Math.sin(rad)];
}

/**
 * Landing wheel showcase — faithful to the Twirla HTML mockup:
 * SVG segments with labels, gold metallic rim, rim lights, hub, pointer.
 * Click (or tap) the wheel to spin; it eases out onto a random prize.
 */
export default function TwirlaWheelShowcase() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState<string | null>(null);

  const segments = useMemo(
    () =>
      LABELS.map((label, i) => {
        const a0 = i * STEP;
        const a1 = (i + 1) * STEP;
        const [x0, y0] = polar(R, a0);
        const [x1, y1] = polar(R, a1);
        const [tx, ty] = polar(R * 0.62, a0 + STEP / 2);
        return {
          d: `M${R},${R} L${x0},${y0} A${R},${R} 0 0,1 ${x1},${y1} Z`,
          color: COLORS[i % COLORS.length],
          label,
          tx,
          ty,
          rot: a0 + STEP / 2,
        };
      }),
    [],
  );

  const lights = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return { left: 50 + Math.cos(a) * 46, top: 50 + Math.sin(a) * 46, delay: i * 0.11 };
      }),
    [],
  );

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWin(null);
    const idx = Math.floor(Math.random() * N);
    const target = 360 * 5 + (360 - (idx * STEP + STEP / 2));
    setRotation((prev) => prev + target);
    window.setTimeout(() => {
      setWin(LABELS[idx]);
      setSpinning(false);
      confetti({
        particleCount: 130,
        spread: 75,
        startVelocity: 42,
        origin: { y: 0.5 },
        colors: ['#db2777', '#7b5cff', '#f6d67b', '#ff2e9a', '#ffffff'],
      });
    }, 4700);
  };

  return (
    <div className="twx-wheel-wrap">
      <div className="twx-wheel-scene">
        <div className="twx-wheel-box" role="button" tabIndex={0} onClick={spin} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && spin()} aria-label="Rrotullo rrotën">
          <div className="twx-wheel-glow" />
          <div className="twx-wheel-rim" />
          {lights.map((l, i) => (
            <span key={i} className="twx-rim-light" style={{ left: `${l.left}%`, top: `${l.top}%`, animationDelay: `${l.delay}s` }} />
          ))}
          <div className="twx-pointer" />
          <svg
            className="twx-wheel"
            viewBox="0 0 200 200"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((s, i) => (
              <path key={`p${i}`} d={s.d} fill={s.color} stroke="rgba(255,255,255,.18)" strokeWidth={0.6} />
            ))}
            {segments.map((s, i) => (
              <text
                key={`t${i}`}
                x={s.tx}
                y={s.ty}
                fill="#fff"
                fontSize={11}
                fontWeight={800}
                fontFamily="'Space Grotesk', sans-serif"
                textAnchor="middle"
                transform={`rotate(${s.rot} ${s.tx} ${s.ty})`}
              >
                {s.label}
              </text>
            ))}
          </svg>
          <div className="twx-wheel-dome" />
          <div className="twx-wheel-gloss" />
          <div className="twx-hub">FATI</div>
        </div>
      </div>
      <p className={`twx-wheel-hint ${win ? 'twx-wheel-hint--win' : ''}`}>
        {win ? `🎉 Fitove ${win}!` : '👆 Prek rrotën për ta rrotulluar'}
      </p>
    </div>
  );
}
