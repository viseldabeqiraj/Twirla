import { useState, useEffect } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { canUserPlay, recordPlay } from '../../utils/playTracking';
import { useTranslation } from '../../i18n/i18n';
import Confetti from '../Confetti';
import './TapHeartsExperience.css';

interface TapHeartsExperienceProps {
  config: ShopConfig;
}

interface Heart {
  id: number;
  x: number;
  y: number;
  tapped: boolean;
}

export default function TapHeartsExperience({ config }: TapHeartsExperienceProps) {
  const { tapHearts, text, shopId, playCooldownHours = 24 } = config;
  const { t } = useTranslation();
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [showReveal, setShowReveal] = useState(false);

  if (!tapHearts) return null;

  // Check if user can play
  const playStatus = canUserPlay(shopId, playCooldownHours);

  useEffect(() => {
    // Create enough hearts (at least 1.5x the required amount for better UX)
    const heartCount = Math.max(tapHearts.heartsToTap * 2, 15);
    const newHearts: Heart[] = [];
    
    for (let i = 0; i < heartCount; i++) {
      newHearts.push({
        id: i,
        x: Math.random() * 80 + 10, // 10-90%
        y: Math.random() * 80 + 10,
        tapped: false,
      });
    }
    
    setHearts(newHearts);
  }, [tapHearts.heartsToTap]);

  const handleHeartTap = (heartId: number) => {
    if (!playStatus.canPlay) return;
    
    setHearts(prev => prev.map(heart => 
      heart.id === heartId && !heart.tapped
        ? { ...heart, tapped: true }
        : heart
    ));
    
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= tapHearts.heartsToTap && !showReveal) {
        setTimeout(() => {
          setShowReveal(true);
          recordPlay(shopId);
        }, 300);
      }
      return newCount;
    });
  };

  // Show blocked message if user can't play
  if (!playStatus.canPlay) {
    const hoursText = playStatus.hoursRemaining === 1 
      ? t('wheel.hour') 
      : t('wheel.hours');
    return (
      <div className="hearts-message">
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

  if (showReveal) {
    return (
      <div className="hearts-reveal" style={{ position: 'relative' }}>
        <Confetti />
        <h2 className="reveal-title" style={{ position: 'relative', zIndex: 1 }}>{text.resultTitle}</h2>
        <p className="reveal-text" style={{ position: 'relative', zIndex: 1 }}>{tapHearts.revealText}</p>
        {tapHearts.revealSubtitle && (
          <p className="reveal-subtitle" style={{ position: 'relative', zIndex: 1 }}>{tapHearts.revealSubtitle}</p>
        )}
        {text.resultSubtitle && (
          <p className="result-subtitle" style={{ position: 'relative', zIndex: 1 }}>{text.resultSubtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className="hearts-container">
      <div className="hearts-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${(tapCount / tapHearts.heartsToTap) * 100}%`,
              backgroundColor: tapHearts.heartColor 
            }}
          />
        </div>
        <p className="progress-text">
          {t('tapHearts.heartsTapped', { 
            count: tapCount, 
            total: tapHearts.heartsToTap 
          })}
        </p>
      </div>
      
      <div className="hearts-area">
        {hearts.map(heart => (
          <button
            key={heart.id}
            className={`heart ${heart.tapped ? 'tapped' : ''}`}
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              color: tapHearts.heartColor,
              animationDelay: `${(heart.id * 0.1) % 3}s`,
            }}
            onClick={() => !heart.tapped && handleHeartTap(heart.id)}
            disabled={heart.tapped}
          >
            ❤️
          </button>
        ))}
      </div>
    </div>
  );
}

