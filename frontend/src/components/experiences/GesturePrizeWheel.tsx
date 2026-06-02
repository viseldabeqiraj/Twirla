/**
 * Drag-to-spin prize wheel (canvas).
 *
 * We do not bundle `react-wheel-of-prizes`: it declares React ^16 only (npm fails on React 18) and
 * is GPL-3.0. Behaviour matches the familiar segment wheel + easing pattern; see
 * https://www.npmjs.com/package/react-wheel-of-prizes for a button-driven reference implementation.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getContrastText } from '../../theme/shopTheme';
import './GesturePrizeWheel.css';

export interface GesturePrizeWheelProps {
  labels: string[];
  colors: string[];
  size: number;
  disabled?: boolean;
  /** Extra full turns before the wheel settles (visual only). */
  fullTurns?: number;
  /** Minimum angular speed (rad/s) while dragging to commit a spin on release. */
  minAngularSpeed?: number;
  pickWinnerIndex: () => number;
  /** After a strong flick; return false to cancel the spin (e.g. cooldown / already played). */
  onSpinStart?: () => boolean | void;
  onSettled: (winnerIndex: number) => void;
}

type Phase = 'idle' | 'dragging' | 'spinning' | 'settled';

function normalizeDeg(d: number): number {
  let x = d % 360;
  if (x < 0) x += 360;
  return x;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Split into lines so each fits `maxWidth` (px); breaks long words by character. */
function wrapLabelToLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [''];
  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  const pushChunk = (chunk: string) => {
    if (chunk.length === 0) return;
    if (ctx.measureText(chunk).width <= maxWidth) {
      lines.push(chunk);
      return;
    }
    let part = '';
    for (const ch of chunk) {
      const next = part + ch;
      if (ctx.measureText(next).width <= maxWidth) part = next;
      else {
        if (part) lines.push(part);
        part = ch;
      }
    }
    if (part) lines.push(part);
  };

  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth) {
      current = trial;
    } else {
      if (current) {
        lines.push(current);
        current = '';
      }
      if (ctx.measureText(word).width <= maxWidth) {
        current = word;
      } else {
        pushChunk(word);
      }
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export function buildWheelSegmentColors(
  count: number,
  primary: string,
  secondary: string,
  accent?: string,
): string[] {
  const palette = [primary, secondary, accent ?? primary];
  return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
}

export default function GesturePrizeWheel({
  labels,
  colors,
  size,
  disabled = false,
  fullTurns = 4,
  minAngularSpeed = 2.4,
  pickWinnerIndex,
  onSpinStart,
  onSettled,
}: GesturePrizeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  const rafSpinRef = useRef<number>(0);
  const pointerIdRef = useRef<number | null>(null);
  const lastRef = useRef<{ t: number; ang: number } | null>(null);
  const angularSpeedRef = useRef(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [hintShake, setHintShake] = useState(false);
  const [rimPulse, setRimPulse] = useState(false);

  const n = labels.length;
  const sliceDeg = n > 0 ? 360 / n : 360;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = size * dpr;
    if (canvas.width !== px || canvas.height !== px) {
      canvas.width = px;
      canvas.height = px;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 10;
    const rot = (rotationRef.current * Math.PI) / 180;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    const sliceRad = (2 * Math.PI) / n;
    /** Keep labels off hub and outer rim (px in CSS pixels). */
    const hubR = r * 0.2;
    const outerInset = Math.max(8, r * 0.07);
    const rInner = hubR + 3;
    const rOuter = r - outerInset;
    const anchorRad = (rInner + rOuter) / 2;
    const maxRadialLineWidth = Math.max(24, rOuter - rInner - 4);
    const maxTangentHalf = Math.max(10, anchorRad * Math.tan(sliceRad / 2) * 0.88);

    for (let i = 0; i < n; i++) {
      const start = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const end = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const mid = (start + end) / 2;
      const rawLabel = labels[i]?.trim() ?? '';
      ctx.save();
      ctx.rotate(mid);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = getContrastText(colors[i % colors.length]);

      let fontPx = Math.max(9, Math.min(13, size / 22));
      let lines: string[] = [];
      let lineHeight = 0;
      for (let attempt = 0; attempt < 10; attempt++) {
        ctx.font = `700 ${fontPx}px ui-sans-serif, system-ui, sans-serif`;
        lineHeight = fontPx * 1.18;
        lines = wrapLabelToLines(ctx, rawLabel, maxRadialLineWidth);
        const blockHalf = (lines.length * lineHeight) / 2;
        const widths = lines.map((ln) => ctx.measureText(ln).width);
        const widest = widths.length ? Math.max(...widths) : 0;
        const fitsTangent = blockHalf <= maxTangentHalf;
        const fitsRadial = widest <= maxRadialLineWidth + 0.5;
        if (fitsTangent && fitsRadial) break;
        fontPx = Math.max(8, fontPx - 0.75);
      }

      const startY = -((lines.length - 1) * lineHeight) / 2;
      for (let li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], anchorRad, startY + li * lineHeight);
      }
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(15,23,42,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [colors, labels, n, size]);

  const stopSpinRaf = () => {
    if (rafSpinRef.current) {
      cancelAnimationFrame(rafSpinRef.current);
      rafSpinRef.current = 0;
    }
  };

  const animateToWinner = useCallback(
    (winnerIndex: number) => {
      const current = rotationRef.current;
      const mod = normalizeDeg(current);
      const sliceCenter = winnerIndex * sliceDeg + sliceDeg / 2;
      const targetMod = normalizeDeg(360 - sliceCenter);
      let align = targetMod - mod;
      if (align < 0) align += 360;
      const extra = fullTurns * 360;
      const end = current + extra + align;
      const start = current;
      const spinBoost = Math.min(1.4, angularSpeedRef.current / 8);
      const duration = 2800 + spinBoost * 900;
      const t0 = performance.now();

      phaseRef.current = 'spinning';
      setPhase('spinning');

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const e = easeOutCubic(t);
        rotationRef.current = start + (end - start) * e;
        draw();
        if (t < 1) {
          rafSpinRef.current = requestAnimationFrame(tick);
        } else {
          rotationRef.current = end;
          draw();
          phaseRef.current = 'settled';
          setPhase('settled');
          setRimPulse(true);
          window.setTimeout(() => setRimPulse(false), 700);
          onSettled(winnerIndex);
          window.setTimeout(() => {
            phaseRef.current = 'idle';
            setPhase('idle');
          }, 80);
        }
      };
      rafSpinRef.current = requestAnimationFrame(tick);
    },
    [draw, fullTurns, onSettled, sliceDeg],
  );

  const pointerAngle = (cx: number, cy: number, px: number, py: number) =>
    Math.atan2(py - cy, px - cx);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || phaseRef.current === 'spinning') return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    el.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    lastRef.current = {
      t: e.timeStamp,
      ang: pointerAngle(cx, cy, e.clientX, e.clientY),
    };
    angularSpeedRef.current = 0;
    phaseRef.current = 'dragging';
    setPhase('dragging');
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (phaseRef.current !== 'dragging' || pointerIdRef.current !== e.pointerId) return;
    const el = wrapRef.current;
    const last = lastRef.current;
    if (!el || !last) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ang = pointerAngle(cx, cy, e.clientX, e.clientY);
    let d = ang - last.ang;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const dt = Math.max(0.001, (e.timeStamp - last.t) / 1000);
    const omega = Math.abs(d / dt);
    angularSpeedRef.current = angularSpeedRef.current * 0.45 + omega * 0.55;
    rotationRef.current += (d * 180) / Math.PI;
    lastRef.current = { t: e.timeStamp, ang };
    draw();
  };

  const endDrag = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const el = wrapRef.current;
    try {
      el?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pointerIdRef.current = null;
    lastRef.current = null;
    if (phaseRef.current !== 'dragging') return;

    phaseRef.current = 'idle';
    setPhase('idle');

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

    const win = pickWinnerIndex();
    animateToWinner(win);
  };

  useEffect(() => {
    draw();
    return () => stopSpinRaf();
  }, [draw]);

  if (n < 2) {
    return (
      <div
        className="gesture-prize-wheel gesture-prize-wheel--disabled"
        style={{ width: size, height: size }}
        role="status"
        aria-live="polite"
      />
    );
  }

  return (
    <div className="gesture-prize-wheel-shell" style={{ width: size }}>
      <div className="gesture-prize-wheel__pointer" aria-hidden>
        <span className="gesture-prize-wheel__pointer-outline" />
        <span className="gesture-prize-wheel__pointer-triangle" />
      </div>
      <div
        ref={wrapRef}
        className={`gesture-prize-wheel ${phase === 'spinning' ? 'gesture-prize-wheel--spinning' : ''} ${
          rimPulse ? 'gesture-prize-wheel--pulse' : ''
        } ${hintShake ? 'gesture-prize-wheel--shake' : ''} ${disabled ? 'gesture-prize-wheel--disabled' : ''}`}
        style={{ width: size, height: size, touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <canvas ref={canvasRef} className="gesture-prize-wheel__canvas" aria-hidden />
      </div>
    </div>
  );
}
