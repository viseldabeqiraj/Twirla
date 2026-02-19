import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/i18n';
import Confetti from '../components/Confetti';
import './HomePage.css';

export default function HomePage() {
  const { t } = useTranslation();
  const [isRevealed, setIsRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isScratchingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlay = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Draw silvery gradient overlay (right to left)
      const gradient = ctx.createLinearGradient(rect.width, 0, 0, 0);
      gradient.addColorStop(0, '#f0ecef');
      gradient.addColorStop(0.3, '#e0dce0');
      gradient.addColorStop(0.6, '#d0ccd0');
      gradient.addColorStop(1, '#c0bcc0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Draw diagonal stripes pattern on top
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      const stripeSpacing = 10;
      const angle = (55 * Math.PI) / 180; // 4 degrees in radians
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // Draw diagonal lines
      for (let i = -rect.height; i < rect.width + rect.height; i += stripeSpacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + rect.height * sin / cos, rect.height);
        ctx.stroke();
      }
      ctx.restore();
      
      // Draw card label on overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      // Center text vertically
      ctx.fillText(t('scratch.cardLabel'), rect.width / 2, rect.height / 2);
    };

    drawOverlay();

    const resizeObserver = new ResizeObserver(drawOverlay);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [isRevealed, t]);

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
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * scaleX, y * scaleY, 30 * Math.max(scaleX, scaleY), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Calculate revealed percentage
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

    if (revealed >= 60 && !isRevealed) {
      setIsRevealed(true);
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

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-logo">
          <img 
            src="/logos/twirla.png" 
            alt="Twirla" 
            className="twirla-logo-large"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <p className="home-tagline">{t('home.tagline')}</p>
        </div>
        
        <p className="home-scratch-hint">{t('home.scratchHint').replace('✨ ', '')}</p>
        
        {isRevealed ? (
          <div className="home-reveal">
            <Confetti count={30} />
            <h2 className="coming-soon-big">{t('home.comingSoon')}</h2>
            <p className="coming-soon-subtitle">{t('home.comingSoonSubtitle')}</p>
          </div>
        ) : (
          <div className="home-scratch-card">
            <div className="scratch-card-content">
              <h2 className="coming-soon">{t('home.comingSoon')}</h2>
            </div>
            <canvas
              ref={canvasRef}
              className="home-scratch-canvas"
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          </div>
        )}
      </div>
    </div>
  );
}

