import { ExperienceMode } from '../types/ShopConfig';
import './GameIntroPreview.css';

interface GameIntroPreviewProps {
  mode: ExperienceMode;
  className?: string;
}

/** Shared pre-play animation strip — same frame and motion language across games. */
export default function GameIntroPreview({ mode, className }: GameIntroPreviewProps) {
  const rootClass = ['game-intro-preview', 'experience-game-intro-visual', className].filter(Boolean).join(' ');

  switch (mode) {
    case ExperienceMode.Runner:
      return (
        <div className={rootClass} aria-hidden>
          <div className="game-intro-preview__runner-character">
            <span className="game-intro-preview__runner-eye game-intro-preview__runner-eye--left" />
            <span className="game-intro-preview__runner-eye game-intro-preview__runner-eye--right" />
          </div>
          <div className="game-intro-preview__runner-ground" />
          <div className="game-intro-preview__runner-obstacle" />
        </div>
      );

    case ExperienceMode.MemoryMatch:
      return (
        <div className={rootClass} aria-hidden>
          <div className="game-intro-preview__memory-grid">
            <div className="game-intro-preview__memory-card game-intro-preview__memory-card--back">
              <span>t</span>
            </div>
            <div className="game-intro-preview__memory-card game-intro-preview__memory-card--flip">
              <span className="game-intro-preview__memory-card-back-face">t</span>
              <span className="game-intro-preview__memory-card-front-face">✨</span>
            </div>
            <div className="game-intro-preview__memory-card game-intro-preview__memory-card--back">
              <span>t</span>
            </div>
          </div>
        </div>
      );

    case ExperienceMode.TapHearts:
      return (
        <div className={rootClass} aria-hidden>
          <span className="game-intro-preview__catch-item game-intro-preview__catch-item--1">❤️</span>
          <span className="game-intro-preview__catch-item game-intro-preview__catch-item--2">🎁</span>
          <span className="game-intro-preview__catch-item game-intro-preview__catch-item--3">⭐</span>
          <span className="game-intro-preview__catch-item game-intro-preview__catch-item--4">💎</span>
        </div>
      );

    case ExperienceMode.Countdown:
      return (
        <div className={rootClass} aria-hidden>
          <div className="game-intro-preview__countdown-ring" />
          <span className="game-intro-preview__countdown-icon">⏳</span>
        </div>
      );

    default:
      return null;
  }
}
