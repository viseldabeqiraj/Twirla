import React, { useCallback, useEffect, useRef, useState } from 'react';
import './ScratchCard.css';

const SAMPLE_STEP = 8;
const BRUSH_BASE = 18;
const BRUSH_TOUCH = 20;
const SUSPENSE_MS = 260;
const FADE_MS = 320;

export interface ScratchCardProps {
  /** Content shown under the scratch layer (and after reveal unless revealToModal) */
  hiddenContent?: React.ReactNode;
  /** Percentage scratched (0–100) that triggers auto full reveal */
  revealThreshold?: number;
  /** Called when the reveal animation is complete (e.g. for confetti) */
  onReveal?: () => void;
  /** Foil fades out and onReveal runs without showing hiddenContent (for shared RewardModal flow) */
  revealToModal?: boolean;
  /** Text drawn on the foil layer, centered (e.g. "Scratch here") */
  instructionText?: string;
  /** Optional instruction above the card (if not using instructionText on foil) */
  instruction?: React.ReactNode;
  /** Aspect ratio of the card e.g. "16/10" */
  aspectRatio?: string;
  /** Called once when the user first touches/scratches (e.g. for analytics) */
  onFirstTouch?: () => void;
  /** Rendered on top of revealed content, clipped to the card (e.g. confetti) */
  celebration?: React.ReactNode;
}

export default function ScratchCard({
  hiddenContent,
  revealThreshold = 50,
  onReveal,
  instructionText,
  instruction,
  aspectRatio = '16/10',
  onFirstTouch,
  celebration,
  revealToModal = false,
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
  const coinRef = useRef<HTMLDivElement>(null);
  const [showInstructionPulse, setShowInstructionPulse] = useState(true);
  const [isPressing, setIsPressing] = useState(false);
  const [isTouchPointer, setIsTouchPointer] = useState(false);
  const [coinVisible, setCoinVisible] = useState(false);

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
    const bleed = 2;
    const edgeInset = 3;
    const shell = canvas.closest('.scratch-card-container');
    const radiusPx = shell ? parseFloat(getComputedStyle(shell).borderTopLeftRadius) : 20;
    const cornerR = Number.isFinite(radiusPx) && radiusPx > 0 ? radiusPx : 20;

    const rnd = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    ctx.save();
    if (typeof (ctx as CanvasRenderingContext2D & { roundRect?: unknown }).roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, cornerR);
      ctx.clip();
    }

    const fillFull = () => ctx.fillRect(-bleed, -bleed, w + bleed * 2, h + bleed * 2);

    // 1. Silver metallic base with richer contrast
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, '#6b6e76');
    base.addColorStop(0.08, '#d8dce5');
    base.addColorStop(0.18, '#8a8d95');
    base.addColorStop(0.32, '#e8ecf2');
    base.addColorStop(0.45, '#5e6168');
    base.addColorStop(0.58, '#cdd2da');
    base.addColorStop(0.72, '#6e7179');
    base.addColorStop(0.85, '#e3e7ee');
    base.addColorStop(1, '#767981');
    ctx.fillStyle = base;
    fillFull();

    // 2. Holographic iridescent layer — subtle rainbow tint
    ctx.save();
    ctx.globalAlpha = 0.14;
    const holo = ctx.createLinearGradient(0, 0, w, h * 0.6);
    holo.addColorStop(0, '#ff6b9d');
    holo.addColorStop(0.2, '#c084fc');
    holo.addColorStop(0.4, '#60a5fa');
    holo.addColorStop(0.6, '#34d399');
    holo.addColorStop(0.8, '#fbbf24');
    holo.addColorStop(1, '#fb7185');
    ctx.fillStyle = holo;
    fillFull();
    ctx.restore();

    // 3. Second holographic band (cross direction for depth)
    ctx.save();
    ctx.globalAlpha = 0.08;
    const holo2 = ctx.createLinearGradient(w, 0, 0, h);
    holo2.addColorStop(0, '#a78bfa');
    holo2.addColorStop(0.3, '#67e8f9');
    holo2.addColorStop(0.6, '#fda4af');
    holo2.addColorStop(1, '#86efac');
    ctx.fillStyle = holo2;
    fillFull();
    ctx.restore();

    // 4. Diagonal metallic shift — light/shadow bands
    const shift = ctx.createLinearGradient(0, 0, w * 0.7, h * 0.8);
    shift.addColorStop(0, 'rgba(255,255,255,0.35)');
    shift.addColorStop(0.35, 'rgba(255,255,255,0.05)');
    shift.addColorStop(0.65, 'rgba(0,0,0,0.08)');
    shift.addColorStop(1, 'rgba(255,255,255,0.2)');
    ctx.fillStyle = shift;
    fillFull();

    // 5. Pearl sheen highlight
    const sheen = ctx.createRadialGradient(w * 0.28, h * 0.2, 0, w * 0.5, h * 0.5, w * 0.9);
    sheen.addColorStop(0, 'rgba(255,255,255,0.6)');
    sheen.addColorStop(0.35, 'rgba(255,255,255,0.12)');
    sheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheen;
    fillFull();

    // 6. Brushed-metal diagonal lines (inset so strokes do not stack on top/bottom edges)
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.8;
    const step = 5;
    const angle = (32 * Math.PI) / 180;
    const innerH = h - edgeInset * 2;
    for (let i = -h; i < w + h; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, edgeInset);
      ctx.lineTo(i + innerH * Math.tan(angle), h - edgeInset);
      ctx.stroke();
    }
    ctx.restore();

    // 7. Fine cross-hatching for extra texture
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    const angle2 = (-25 * Math.PI) / 180;
    for (let i = -h; i < w + h; i += step * 2) {
      ctx.beginPath();
      ctx.moveTo(i, edgeInset);
      ctx.lineTo(i + innerH * Math.tan(angle2), h - edgeInset);
      ctx.stroke();
    }
    ctx.restore();

    // 8. Metallic grain noise
    ctx.save();
    ctx.globalAlpha = 0.1;
    const noiseCount = Math.min(1600, Math.floor((w * h) / 60));
    for (let i = 0; i < noiseCount; i++) {
      const x = rnd(i) * w;
      const y = rnd(i + 200) * h;
      const v = rnd(i + 400) > 0.5 ? 35 : 245;
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();

    // 9. Holographic sparkle dots
    ctx.save();
    const sparkleColors = ['#fff', '#e0f2fe', '#fce7f3', '#f0fdf4', '#fef3c7'];
    const sparkleCount = Math.min(28, Math.floor((w * h) / 1200));
    for (let i = 0; i < sparkleCount; i++) {
      const sx = rnd(i * 31) * w;
      const sy = rnd(i * 37 + 7) * h;
      const sr = 0.6 + rnd(i * 41) * 1.2;
      ctx.globalAlpha = 0.15 + rnd(i * 43) * 0.25;
      ctx.fillStyle = sparkleColors[i % sparkleColors.length];
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 10. Faint pre-existing scratch marks
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 0.12;
    const scratchCount = 4 + Math.floor(rnd(99) * 3);
    for (let i = 0; i < scratchCount; i++) {
      const sx = 0.15 * w + rnd(i * 7) * 0.7 * w;
      const sy = 0.2 * h + rnd(i * 11 + 3) * 0.6 * h;
      const len = 12 + rnd(i * 13) * 30;
      const sa = rnd(i * 17) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + len * Math.cos(sa), sy + len * Math.sin(sa));
      ctx.lineWidth = 3 + rnd(i * 19) * 5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore(); /* roundRect clip */

    // Instruction text is rendered as an HTML overlay (scratch-card-instruction-pulse)
    // so we skip drawing it on the canvas to avoid duplication.

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

  const getScratchPosition = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const updateCoinPointer = useCallback((pos: { x: number; y: number }) => {
    const coin = coinRef.current;
    if (!coin) return;
    coin.style.left = `${pos.x}px`;
    coin.style.top = `${pos.y}px`;
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

      const brush = isTouch ? BRUSH_TOUCH : BRUSH_BASE;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(x, y, brush, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
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

      const brush = isTouch ? BRUSH_TOUCH : BRUSH_BASE;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.85;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.lineWidth = brush * 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      const pct = getRevealedPercent();
      if (pct >= revealThreshold) setIsRevealing(true);
    },
    [isRevealed, isRevealing, revealThreshold, getRevealedPercent]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setShowInstructionPulse(false);
      setIsPressing(true);
      if (!hasFiredFirstTouchRef.current) {
        hasFiredFirstTouchRef.current = true;
        onFirstTouch?.();
      }
      const pos = getScratchPosition(e);
      if (pos) {
        isScratchingRef.current = true;
        lastRef.current = pos;
        setIsTouchPointer(e.pointerType === 'touch');
        setCoinVisible(true);
        updateCoinPointer(pos);
        scratchAt(pos.x, pos.y, e.pointerType === 'touch');
      }
    },
    [getScratchPosition, scratchAt, onFirstTouch, updateCoinPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const pos = getScratchPosition(e);
      if (!pos) return;

      if (isScratchingRef.current && lastRef.current) {
        setIsTouchPointer(e.pointerType === 'touch');
        updateCoinPointer(pos);
        drawLine(lastRef.current, pos, e.pointerType === 'touch');
        lastRef.current = pos;
      } else if (e.pointerType === 'mouse') {
        setCoinVisible(true);
        updateCoinPointer(pos);
      }
    },
    [getScratchPosition, drawLine, updateCoinPointer],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    isScratchingRef.current = false;
    lastRef.current = null;
    setIsPressing(false);
    setCoinVisible(false);
  }, []);

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType !== 'mouse') return;
      const pos = getScratchPosition(e);
      if (pos) {
        updateCoinPointer(pos);
        setCoinVisible(true);
      }
    },
    [getScratchPosition, updateCoinPointer],
  );

  const handlePointerLeave = useCallback(() => {
    if (!isScratchingRef.current) {
      setCoinVisible(false);
    }
  }, []);

  // Reveal sequence: suspense -> fade foil -> reveal complete -> onReveal (confetti)
  useEffect(() => {
    if (!isRevealing) return;
    const t1 = setTimeout(() => setFadeOut(true), SUSPENSE_MS);
    const t2 = setTimeout(() => {
      if (!revealToModal) {
        setIsRevealed(true);
      }
      onReveal?.();
    }, SUSPENSE_MS + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isRevealing, onReveal, revealToModal]);

  return (
    <div className="scratch-card-wrap" ref={containerRef}>
      {instruction != null && !instructionText && (
        <p className="scratch-card-instruction">{instruction}</p>
      )}
      <div className="scratch-card-shadow">
      <div
        className={`scratch-card-container ${isRevealed ? 'scratch-card-container--revealed' : ''}`}
        style={{ aspectRatio }}
      >
        <div className={`scratch-card-inner ${isPressing ? 'scratch-card-inner--pressing' : ''}`}>
          <div className={`scratch-card-content ${isRevealed ? 'scratch-card-reveal-anim' : ''}`}>
            {hiddenContent}
          </div>
          {!isRevealed && (
            <div
              className={`scratch-card-canvas-wrap ${!isPressing && !fadeOut ? 'scratch-card-canvas-wrap--idle' : ''}`}
            >
              {instructionText && showInstructionPulse && (
                <span className="scratch-card-instruction-pulse" aria-hidden="true">
                  <span className="scratch-card-instruction-pulse__label">{instructionText}</span>
                </span>
              )}
              <canvas
                ref={canvasRef}
                className={`scratch-card-canvas ${fadeOut ? 'scratch-card-canvas--fade' : ''}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
              />
              <div className="scratch-card-shine" aria-hidden="true" />
              <div
                ref={coinRef}
                className={`scratch-card-coin-pointer ${isTouchPointer ? 'scratch-card-coin-pointer--touch' : ''} ${
                  coinVisible && !fadeOut ? 'scratch-card-coin-pointer--visible' : ''
                } ${isPressing ? 'scratch-card-coin-pointer--pressing' : ''}`}
                aria-hidden="true"
              />
            </div>
          )}
          {isRevealed && celebration != null ? (
            <div className="scratch-card-celebration" aria-hidden="true">
              {celebration}
            </div>
          ) : null}
        </div>
      </div>
      </div>
    </div>
  );
}
