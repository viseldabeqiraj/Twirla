import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fireConfetti } from '../utils/confetti';
import { getContrastText } from '../theme/shopTheme';
import './PrizeWheel.css';

const R = 100; // SVG viewBox radius (viewBox is 0 0 200 200)

export type WheelInteraction = 'tap' | 'drag' | 'none';

export interface PrizeWheelProps {
  /** Segment labels, clockwise from the top pointer. */
  labels: string[];
  /** Segment fill colors (shop brand palette). Cycled if shorter than labels. */
  colors: string[];
  /** Rendered pixel size. Omit to use the responsive CSS default. */
  size?: number;
  /** How the user spins it. 'none' is purely decorative. Default 'tap'. */
  interactive?: WheelInteraction;
  /** Text inside the gold hub. Default "FATI". */
  hubText?: string;
  /** Draw segment labels. Turn off for tiny decorative wheels. Default true. */
  showLabels?: boolean;
  /** Slow idle rotation (only when interactive === 'none'). */
  autoSpin?: boolean;
  /** Blocks spinning (cooldown / already played). */
  disabled?: boolean;
  /** Extra full turns before settling. */
  fullTurns?: number;
  /** Minimum flick speed (rad/s) to commit a drag spin. */
  minAngularSpeed?: number;
  /** Fire a confetti burst when a spin settles. Default false. */
  confettiOnWin?: boolean;
  /** Choose the winning segment index. Defaults to uniform random. */
  pickWinnerIndex?: () => number;
  /** Return false to cancel a spin (e.g. cooldown). */
  onSpinStart?: () => boolean | void;
  /** Called with the settled winner index. */
  onSettled?: (winnerIndex: number) => void;
  className?: string;
  ariaLabel?: string;
}

type Phase = 'idle' | 'dragging' | 'spinning';

function polar(r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [R + r * Math.cos(rad), R + r * Math.sin(rad)];
}

function normalizeDeg(d: number): number {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Wrap label into up to 2 lines that fit `maxWidth` (SVG user units). */
function wrapPrizeLabel(label: string, maxWidth: number, fontSize: number): string[] {
  const trimmed = label.trim();
  if (!trimmed) return [''];

  let measure: (text: string) => number;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `800 ${fontSize}px "Space Grotesk", ui-sans-serif, system-ui, sans-serif`;
      measure = (text) => ctx.measureText(text).width;
    } else {
      measure = (text) => text.length * fontSize * 0.62;
    }
  } else {
    measure = (text) => text.length * fontSize * 0.62;
  }

  if (measure(trimmed) <= maxWidth) return [trimmed];

  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    // Break a long token roughly in half, then trim to fit.
    const mid = Math.ceil(trimmed.length / 2);
    let left = trimmed.slice(0, mid);
    let right = trimmed.slice(mid);
    while (measure(left) > maxWidth && left.length > 1) left = left.slice(0, -1);
    while (measure(right) > maxWidth && right.length > 1) right = right.slice(0, -1);
    return [left, right].filter(Boolean);
  }

  // Prefer a balanced two-line split on word boundaries.
  let best: string[] | null = null;
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const wa = measure(a);
    const wb = measure(b);
    if (wa > maxWidth || wb > maxWidth) continue;
    const score = Math.abs(wa - wb) + Math.max(wa, wb);
    if (score < bestScore) {
      bestScore = score;
      best = [a, b];
    }
  }
  if (best) return best;

  // Fallback: greedy wrap, then clamp to 2 lines.
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (measure(trial) <= maxWidth) {
      current = trial;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= 2) return lines.length ? lines : [trimmed];
  return [lines[0], lines.slice(1).join(' ')];
}

/**
 * Reusable premium prize wheel — the gold-rim / rim-lights / glossy dome look from
 * the landing showcase, now driven by props so it can be used everywhere: as a
 * decorative hero preview, a tap-to-spin demo, or the real drag-to-spin game.
 */
export default function PrizeWheel({
  labels,
  colors,
  size,
  interactive = 'tap',
  hubText = 'FATI',
  showLabels = true,
  autoSpin = false,
  disabled = false,
  fullTurns = interactive === 'drag' ? 4 : 5,
  minAngularSpeed = 2.4,
  confettiOnWin = false,
  pickWinnerIndex,
  onSpinStart,
  onSettled,
  className,
  ariaLabel,
}: PrizeWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef(0);
  const idleRafRef = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const pointerIdRef = useRef<number | null>(null);
  const lastRef = useRef<{ t: number; ang: number } | null>(null);
  const angularSpeedRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [hintShake, setHintShake] = useState(false);

  const n = labels.length;
  const step = n > 0 ? 360 / n : 360;
  const baseDuration = interactive === 'drag' ? 2800 : 4200;

  const segments = useMemo(
    () =>
      labels.map((label, i) => {
        const a0 = i * step;
        const a1 = (i + 1) * step;
        const [x0, y0] = polar(R, a0);
        const [x1, y1] = polar(R, a1);
        const labelR = R * 0.58;
        const [tx, ty] = polar(labelR, a0 + step / 2);
        const large = step > 180 ? 1 : 0;
        // Chord width at label radius, with padding so text stays inside the wedge.
        const maxLabelWidth = Math.max(18, 2 * labelR * Math.sin((step * Math.PI) / 360) * 0.78);
        return {
          d: `M${R},${R} L${x0},${y0} A${R},${R} 0 ${large},1 ${x1},${y1} Z`,
          color: colors[i % colors.length] || '#db2777',
          label,
          maxLabelWidth,
          tx,
          ty,
          rot: a0 + step / 2,
        };
      }),
    [labels, colors, step],
  );

  const lights = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return { left: 50 + Math.cos(a) * 46, top: 50 + Math.sin(a) * 46, delay: i * 0.11 };
      }),
    [],
  );

  const fontSize = useMemo(() => {
    const longest = labels.reduce((m, l) => Math.max(m, l.trim().length), 0);
    let f = 11;
    if (n > 8) f -= 1.5;
    if (longest > 5) f -= 1;
    if (longest > 8) f -= 1.25;
    if (longest > 12) f -= 1.25;
    if (longest > 16) f -= 1;
    return Math.max(6.5, f);
  }, [labels, n]);

  const labeledSegments = useMemo(
    () =>
      segments.map((s) => ({
        ...s,
        lines: wrapPrizeLabel(s.label, s.maxLabelWidth, fontSize),
      })),
    [segments, fontSize],
  );

  const applyRotation = useCallback(() => {
    if (svgRef.current) svgRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
  }, []);

  const burstConfetti = useCallback(() => {
    fireConfetti({ count: 150, originYRatio: 0.5 });
  }, []);

  const stopRaf = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  };

  const animateToWinner = useCallback(
    (winnerIndex: number) => {
      const current = rotationRef.current;
      const mod = normalizeDeg(current);
      const sliceCenter = winnerIndex * step + step / 2;
      const targetMod = normalizeDeg(360 - sliceCenter);
      let align = targetMod - mod;
      if (align < 0) align += 360;
      const boost = Math.min(1.4, angularSpeedRef.current / 8);
      const end = current + fullTurns * 360 + align;
      const duration = baseDuration + boost * 900;
      const start = current;
      const t0 = performance.now();

      phaseRef.current = 'spinning';
      setSpinning(true);
      stopRaf();

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const e = easeOutCubic(t);
        rotationRef.current = start + (end - start) * e;
        applyRotation();
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rotationRef.current = end;
          applyRotation();
          phaseRef.current = 'idle';
          setSpinning(false);
          if (confettiOnWin) burstConfetti();
          onSettled?.(winnerIndex);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [step, fullTurns, baseDuration, applyRotation, confettiOnWin, burstConfetti, onSettled],
  );

  const pickIndex = useCallback(
    () => (pickWinnerIndex ? pickWinnerIndex() : Math.floor(Math.random() * Math.max(1, n))),
    [pickWinnerIndex, n],
  );

  const beginSpin = useCallback(() => {
    if (phaseRef.current === 'spinning' || disabled || n < 2) return;
    if (onSpinStart?.() === false) {
      setHintShake(true);
      window.setTimeout(() => setHintShake(false), 480);
      return;
    }
    animateToWinner(pickIndex());
  }, [disabled, n, onSpinStart, animateToWinner, pickIndex]);

  // ---- drag-to-spin (pointer physics) ----
  const pointerAngle = (cx: number, cy: number, px: number, py: number) => Math.atan2(py - cy, px - cx);

  const onPointerDown = (e: React.PointerEvent) => {
    if (interactive !== 'drag' || disabled || phaseRef.current === 'spinning') return;
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    lastRef.current = {
      t: e.timeStamp,
      ang: pointerAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY),
    };
    angularSpeedRef.current = 0;
    phaseRef.current = 'dragging';
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (phaseRef.current !== 'dragging' || pointerIdRef.current !== e.pointerId) return;
    const el = boxRef.current;
    const last = lastRef.current;
    if (!el || !last) return;
    const rect = el.getBoundingClientRect();
    const ang = pointerAngle(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY);
    let d = ang - last.ang;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const dt = Math.max(0.001, (e.timeStamp - last.t) / 1000);
    const omega = Math.abs(d / dt);
    angularSpeedRef.current = angularSpeedRef.current * 0.45 + omega * 0.55;
    rotationRef.current += (d * 180) / Math.PI;
    lastRef.current = { t: e.timeStamp, ang };
    applyRotation();
  };

  const endDrag = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    try {
      boxRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pointerIdRef.current = null;
    lastRef.current = null;
    if (phaseRef.current !== 'dragging') return;
    phaseRef.current = 'idle';
    if (disabled) return;

    if (angularSpeedRef.current < minAngularSpeed) {
      setHintShake(true);
      window.setTimeout(() => setHintShake(false), 480);
      return;
    }
    if (onSpinStart?.() === false) {
      setHintShake(true);
      window.setTimeout(() => setHintShake(false), 480);
      return;
    }
    animateToWinner(pickIndex());
  };

  // ---- idle auto-spin (decorative) ----
  useEffect(() => {
    if (interactive !== 'none' || !autoSpin) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      rotationRef.current += dt * 0.012; // ~4.3 deg/s
      applyRotation();
      idleRafRef.current = requestAnimationFrame(loop);
    };
    idleRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (idleRafRef.current) cancelAnimationFrame(idleRafRef.current);
    };
  }, [interactive, autoSpin, applyRotation]);

  useEffect(() => stopRaf, []);

  const tappable = interactive === 'tap';
  const draggable = interactive === 'drag';

  const boxProps = draggable
    ? {
        onPointerDown,
        onPointerMove,
        onPointerUp: endDrag,
        onPointerCancel: endDrag,
        style: { touchAction: 'none' as const, cursor: spinning ? 'default' : 'grab' },
      }
    : tappable
      ? {
          role: 'button',
          tabIndex: 0,
          onClick: beginSpin,
          onKeyDown: (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && beginSpin(),
        }
      : {};

  return (
    <div
      className={['prize-wheel', className].filter(Boolean).join(' ')}
      style={size ? { width: size } : undefined}
    >
      <div className="prize-wheel__scene">
        <div
          ref={boxRef}
          className={[
            'prize-wheel__box',
            interactive !== 'none' ? 'prize-wheel__box--interactive' : '',
            spinning ? 'prize-wheel__box--spinning' : '',
            hintShake ? 'prize-wheel__box--shake' : '',
            disabled ? 'prize-wheel__box--disabled' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={ariaLabel ?? 'Rrota e fatit'}
          {...boxProps}
        >
          <div className="prize-wheel__glow" />
          <div className="prize-wheel__rim" />
          {lights.map((l, i) => (
            <span
              key={i}
              className="prize-wheel__light"
              style={{ left: `${l.left}%`, top: `${l.top}%`, animationDelay: `${l.delay}s` }}
            />
          ))}
          <div className="prize-wheel__pointer" />
          <svg ref={svgRef} className="prize-wheel__svg" viewBox="0 0 200 200">
            {labeledSegments.map((s, i) => (
              <path key={`p${i}`} d={s.d} fill={s.color} stroke="rgba(255,255,255,.18)" strokeWidth={0.6} />
            ))}
            {showLabels &&
              labeledSegments.map((s, i) => {
                const lineH = fontSize * 1.15;
                const startY = s.ty - ((s.lines.length - 1) * lineH) / 2;
                return (
                  <text
                    key={`t${i}`}
                    fill={getContrastText(s.color)}
                    fontSize={fontSize}
                    fontWeight={800}
                    fontFamily="'Space Grotesk', sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${s.rot} ${s.tx} ${s.ty})`}
                  >
                    {s.lines.map((line, li) => (
                      <tspan key={li} x={s.tx} y={startY + li * lineH}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                );
              })}
          </svg>
          <div className="prize-wheel__dome" />
          <div className="prize-wheel__gloss" />
          {hubText ? <div className="prize-wheel__hub">{hubText}</div> : <div className="prize-wheel__hub prize-wheel__hub--blank" />}
        </div>
      </div>
    </div>
  );
}
