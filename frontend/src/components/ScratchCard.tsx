import React, { useCallback, useEffect, useRef, useState } from 'react';
import './ScratchCard.css';

const SAMPLE_STEP = 8;
const BRUSH_BASE = 38;
const BRUSH_TOUCH = 56;
const SUSPENSE_MS = 250;
const FADE_MS = 320;

export interface ScratchCardProps {
  /** Content shown under the scratch layer (and after reveal) */
  hiddenContent: React.ReactNode;
  /** Percentage scratched (0–100) that triggers auto full reveal */
  revealThreshold?: number;
  /** Called when the reveal animation is complete (e.g. for confetti) */
  onReveal?: () => void;
  /** Text drawn on the foil layer, centered (e.g. "Scratch here") */
  instructionText?: string;
  /** Optional instruction above the card (if not using instructionText on foil) */
  instruction?: React.ReactNode;
  /** Aspect ratio of the card e.g. "16/10" */
  aspectRatio?: string;
  /** Called once when the user first touches/scratches (e.g. for analytics) */
  onFirstTouch?: () => void;
}

export default function ScratchCard({
  hiddenContent,
  revealThreshold = 50,
  onReveal,
  instructionText,
  instruction,
  aspectRatio = '16/10',
  onFirstTouch,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const isScratchingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const overlayDrawnRef = useRef(false);
  const hasScratchedRef = useRef(false);
  const hasFiredFirstTouchRef = useRef(false);
  const [showInstructionPulse, setShowInstructionPulse] = useState(true);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed || overlayDrawnRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const w = rect.width;
    const h = rect.height;

    // Metallic foil base – stronger silver/pearl
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, '#9fa2a8');
    base.addColorStop(0.12, '#d8dae0');
    base.addColorStop(0.28, '#8c8f96');
    base.addColorStop(0.5, '#c2c5cc');
    base.addColorStop(0.62, '#7d8088');
    base.addColorStop(0.78, '#d0d3da');
    base.addColorStop(1, '#9a9da4');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // Second pass – diagonal metallic shift
    const shift = ctx.createLinearGradient(0, 0, w * 0.7, h * 0.8);
    shift.addColorStop(0, 'rgba(255,255,255,0.2)');
    shift.addColorStop(0.5, 'rgba(255,255,255,0.02)');
    shift.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = shift;
    ctx.fillRect(0, 0, w, h);

    // Pearl sheen (soft radial highlight)
    const sheen = ctx.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.5, h * 0.5, w * 0.9);
    sheen.addColorStop(0, 'rgba(255,255,255,0.4)');
    sheen.addColorStop(0.45, 'rgba(255,255,255,0.06)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    // Subtle diagonal texture (fine lines)
    const rnd = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    const step = 6;
    const angle = (35 * Math.PI) / 180;
    for (let i = -h; i < w + h; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h * Math.tan(angle), h);
      ctx.stroke();
    }
    ctx.restore();

    // Subtle noise texture (denser grain for metallic feel)
    ctx.save();
    ctx.globalAlpha = 0.08;
    const noiseCount = Math.min(1200, Math.floor((w * h) / 80));
    for (let i = 0; i < noiseCount; i++) {
      const x = rnd(i) * w;
      const y = rnd(i + 200) * h;
      const v = rnd(i + 400) > 0.5 ? 60 : 220;
      ctx.fillStyle = `rgb(${v},${v},${v + 8})`;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();

    // Faint pre-existing scratch marks (hint that surface can be scratched)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 0.15;
    const scratchCount = 5 + Math.floor(rnd(99) * 4);
    for (let i = 0; i < scratchCount; i++) {
      const x = 0.15 * w + rnd(i * 7) * 0.7 * w;
      const y = 0.2 * h + rnd(i * 11 + 3) * 0.6 * h;
      const len = 15 + rnd(i * 13) * 25;
      const angle = rnd(i * 17) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len * Math.cos(angle), y + len * Math.sin(angle));
      ctx.lineWidth = 4 + rnd(i * 19) * 6;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();

    // Instruction text: white, engraved look (subtle dark shadow above/left)
    if (instructionText) {
      ctx.save();
      ctx.font = '600 1.1rem -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tx = w / 2;
      const ty = h / 2;
      // Engraved: dark shadow offset up-left, then white fill
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(instructionText, tx, ty);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.restore();
    }

    overlayDrawnRef.current = true;
  }, [isRevealed, instructionText]);

  useEffect(() => {
    drawOverlay();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!hasScratchedRef.current) {
        overlayDrawnRef.current = false;
        drawOverlay();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [drawOverlay]);

  const getScratchPosition = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const getRevealedPercent = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let transparent = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += SAMPLE_STEP) {
      total += 1;
      if (data[i] < 128) transparent += 1;
    }
    return total === 0 ? 0 : (transparent / total) * 100;
  }, []);

  const scratchAt = useCallback(
    (x: number, y: number, isTouch?: boolean) => {
      hasScratchedRef.current = true;
      const canvas = canvasRef.current;
      if (!canvas || isRevealed || isRevealing) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const brush = (isTouch ? BRUSH_TOUCH : BRUSH_BASE) * Math.max(scaleX, scaleY);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x * scaleX, y * scaleY, brush, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      const pct = getRevealedPercent();
      if (pct >= revealThreshold) setIsRevealing(true);
    },
    [isRevealed, isRevealing, revealThreshold, getRevealedPercent]
  );

  const drawLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }, isTouch?: boolean) => {
      hasScratchedRef.current = true;
      const canvas = canvasRef.current;
      if (!canvas || isRevealed || isRevealing) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const brush = (isTouch ? BRUSH_TOUCH : BRUSH_BASE) * Math.max(scaleX, scaleY) * 0.55;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(from.x * scaleX, from.y * scaleY);
      ctx.lineTo(to.x * scaleX, to.y * scaleY);
      ctx.lineWidth = brush * 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';

      const pct = getRevealedPercent();
      if (pct >= revealThreshold) setIsRevealing(true);
    },
    [isRevealed, isRevealing, revealThreshold, getRevealedPercent]
  );

  const handleStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      setShowInstructionPulse(false);
      if (!hasFiredFirstTouchRef.current) {
        hasFiredFirstTouchRef.current = true;
        onFirstTouch?.();
      }
      const pos = getScratchPosition(e);
      if (pos) {
        isScratchingRef.current = true;
        lastRef.current = pos;
        scratchAt(pos.x, pos.y, 'touches' in e);
      }
    },
    [getScratchPosition, scratchAt, onFirstTouch]
  );

  const handleMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isScratchingRef.current) return;
      e.preventDefault();
      const pos = getScratchPosition(e);
      if (pos && lastRef.current) {
        drawLine(lastRef.current, pos, 'touches' in e);
        lastRef.current = pos;
      }
    },
    [getScratchPosition, drawLine]
  );

  const handleEnd = useCallback(() => {
    isScratchingRef.current = false;
    lastRef.current = null;
    document.body.style.overflow = '';
  }, []);

  // Prevent page scroll when touching the scratch canvas (passive: false so preventDefault works)
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = canvasWrapRef.current;
    if (!wrap) return;
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      document.body.style.overflow = 'hidden';
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isScratchingRef.current) e.preventDefault();
    };
    const onTouchEnd = () => {
      document.body.style.overflow = '';
    };
    wrap.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
    wrap.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
    wrap.addEventListener('touchend', onTouchEnd, { capture: true });
    wrap.addEventListener('touchcancel', onTouchEnd, { capture: true });
    return () => {
      wrap.removeEventListener('touchstart', onTouchStart, { capture: true });
      wrap.removeEventListener('touchmove', onTouchMove, { capture: true });
      wrap.removeEventListener('touchend', onTouchEnd, { capture: true });
      wrap.removeEventListener('touchcancel', onTouchEnd, { capture: true });
      document.body.style.overflow = '';
    };
  }, []);

  // Reveal sequence: suspense -> fade foil -> reveal complete -> onReveal (confetti)
  useEffect(() => {
    if (!isRevealing) return;
    const t1 = setTimeout(() => setFadeOut(true), SUSPENSE_MS);
    const t2 = setTimeout(() => {
      setIsRevealed(true);
      onReveal?.();
    }, SUSPENSE_MS + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isRevealing, onReveal]);

  return (
    <div className="scratch-card-wrap" ref={containerRef}>
      {instruction != null && !instructionText && (
        <p className="scratch-card-instruction">{instruction}</p>
      )}
      <div className="scratch-card-container" style={{ aspectRatio }}>
        <div className="scratch-card-inner">
          <div className={`scratch-card-content ${isRevealed ? 'scratch-card-reveal-anim' : ''}`}>
            {hiddenContent}
          </div>
          {!isRevealed && (
            <div className="scratch-card-canvas-wrap" ref={canvasWrapRef}>
              {instructionText && showInstructionPulse && (
                <span className="scratch-card-instruction-pulse" aria-hidden="true">
                  {instructionText}
                </span>
              )}
              <canvas
                ref={canvasRef}
                className={`scratch-card-canvas ${fadeOut ? 'scratch-card-canvas--fade' : ''}`}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                style={{ touchAction: 'none' }}
              />
              <div className="scratch-card-shine" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
