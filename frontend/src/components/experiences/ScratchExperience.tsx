import React, { useState, useRef, useEffect } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { recordPlay } from '../../utils/playTracking';
import { useTranslation } from '../../i18n/i18n';
import Confetti from '../Confetti';
import './ScratchExperience.css';

interface ScratchExperienceProps {
  config: ShopConfig;
}

export default function ScratchExperience({ config }: ScratchExperienceProps) {
  const { scratch, text, shopId } = config;
  const { t } = useTranslation();
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasRecordedPlay, setHasRecordedPlay] = useState(false);
  const [revealedPercent, setRevealedPercent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [failed, setFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isScratchingRef = useRef(false);

  if (!scratch) return null;

  // TEMP (testing): daily cooldown disabled.
  // const playStatus = isRevealed
  //   ? { canPlay: true, lastPlayTime: null, hoursRemaining: null }
  //   : canUserPlay(shopId, playCooldownHours);
  const playStatus = { canPlay: true, hoursRemaining: null as number | null };

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (isRevealed || failed) return s;
        if (s <= 1) {
          setFailed(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRevealed, failed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlay = () => {
      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Draw overlay
      ctx.fillStyle = scratch.overlayColor;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Draw card label on overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t('scratch.cardLabel'), rect.width / 2, rect.height / 2);
    };

    // Initial draw
    drawOverlay();

    // Redraw on resize
    const resizeObserver = new ResizeObserver(drawOverlay);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [scratch, isRevealed, t]);

  const getScratchPosition = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    // Allow scratching even if already revealed (for visual feedback)
    // But don't allow if user can't play (cooldown check)
    if (!canvas || isRevealed || failed) return;
    
    // TEMP (testing): cooldown check removed.
    // const currentPlayStatus = canUserPlay(shopId, playCooldownHours);
    // if (!currentPlayStatus.canPlay) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Use composite operation to "erase" the overlay
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * scaleX, y * scaleY, 30 * Math.max(scaleX, scaleY), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Calculate revealed percentage (sample every 10th pixel for performance)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    const sampleRate = 10;

    for (let i = 3; i < pixels.length; i += 4 * sampleRate) {
      if (pixels[i] < 128) {
        transparentPixels += sampleRate;
      }
    }

    const revealed = (transparentPixels / (pixels.length / 4)) * 100;
    setRevealedPercent(Math.min(100, Math.round(revealed)));

    // If 60% revealed (most of the panel), show full reveal
    if (revealed >= 60 && !isRevealed && !hasRecordedPlay) {
      // Set revealed state first
      setIsRevealed(true);
      // Record play after a delay to ensure reveal UI is shown first
      setTimeout(() => {
        recordPlay(shopId);
        setHasRecordedPlay(true);
      }, 200);
    }
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isScratchingRef.current = true;
    const pos = getScratchPosition(e);
    if (pos) scratchAt(pos.x, pos.y);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isScratchingRef.current) return;
    e.preventDefault();
    const pos = getScratchPosition(e);
    if (pos) scratchAt(pos.x, pos.y);
  };

  const handleEnd = () => {
    isScratchingRef.current = false;
  };

  // Removed click-to-reveal fallback - user must scratch the panel

  // Show blocked message if user can't play
  if (!playStatus.canPlay) {
    const hoursText = playStatus.hoursRemaining === 1 
      ? t('wheel.hour') 
      : t('wheel.hours');
    return (
      <div className="scratch-message">
        <p>{t('wheel.alreadyPlayed')}</p>
        <p className="cooldown-message">
          {t('wheel.comeBackIn', { 
            hours: playStatus.hoursRemaining?.toString() || '0',
            hoursText 
          })}
        </p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="scratch-message">
        <h3>Too slow! 😬</h3>
        <p>You revealed {revealedPercent}%. Reach 60% in 10 seconds.</p>
        <button className="retry-scratch" onClick={() => { setFailed(false); setSecondsLeft(10); setRevealedPercent(0); const c = canvasRef.current; const ctx = c?.getContext('2d'); if (c && ctx) { const r = c.getBoundingClientRect(); ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle = scratch.overlayColor; ctx.fillRect(0,0,r.width,r.height); ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t('scratch.cardLabel'), r.width/2, r.height/2);} }}>Retry</button>
      </div>
    );
  }

  if (isRevealed) {
    return (
      <div className="scratch-reveal" style={{ position: 'relative' }}>
        <Confetti />
        <h2 className="reveal-title" style={{ position: 'relative', zIndex: 1 }}>{text.resultTitle}</h2>
        {text.resultSubtitle && <p className="result-subtitle" style={{ position: 'relative', zIndex: 1 }}>{text.resultSubtitle}</p>}
        <div className="reveal-content" style={{ position: 'relative', zIndex: 1 }}>
          <p className="reveal-text">{scratch.revealText}</p>
          {scratch.revealSubtitle && (
            <p className="reveal-subtitle">{scratch.revealSubtitle}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="scratch-container">
      <div className="scratch-card">
        <div className="reveal-content-background">
          <p className="reveal-text">{scratch.revealText}</p>
          {scratch.revealSubtitle && (
            <p className="reveal-subtitle">{scratch.revealSubtitle}</p>
          )}
        </div>
        <canvas
          ref={canvasRef}
          className="scratch-canvas"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
      <p className="scratch-hint">
        <span className="scratch-icon">✋</span>
        {t('scratch.hint')} · {revealedPercent}% · ⏱️ {secondsLeft}s
      </p>
    </div>
  );
}

