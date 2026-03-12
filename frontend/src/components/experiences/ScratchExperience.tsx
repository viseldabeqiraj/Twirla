import React, { useState } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { recordPlay } from '../../utils/playTracking';
import { trackEvent } from '../../api/analyticsApi';
import { useTranslation } from '../../i18n/i18n';
import Confetti from '../Confetti';
import ScratchCard from '../ScratchCard';
import './ScratchExperience.css';

interface ScratchExperienceProps {
  config: ShopConfig;
}

export default function ScratchExperience({ config }: ScratchExperienceProps) {
  const { scratch, text, shopId, branding } = config;
  const { t } = useTranslation();
  const [showConfetti, setShowConfetti] = useState(false);

  if (!scratch) return null;

  const playStatus = { canPlay: true, hoursRemaining: null as number | null };

  const handleReveal = () => {
    setShowConfetti(true);
    trackEvent(shopId, 'game_finish', { mode: 'Scratch' });
    trackEvent(shopId, 'reward_won', { mode: 'Scratch' });
    recordPlay(shopId);
  };

  const handleFirstTouch = () => {
    trackEvent(shopId, 'game_start', { mode: 'Scratch' });
  };

  if (!playStatus.canPlay) {
    const hoursText = playStatus.hoursRemaining === 1 ? t('wheel.hour') : t('wheel.hours');
    return (
      <div className="scratch-message">
        <p>{t('wheel.alreadyPlayed')}</p>
        <p className="cooldown-message">
          {t('wheel.comeBackIn', {
            hours: playStatus.hoursRemaining?.toString() || '0',
            hoursText,
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="scratch-experience-wrap" style={{ '--scratch-primary': branding.primaryColor, '--scratch-secondary': branding.secondaryColor } as React.CSSProperties}>
      <ScratchCard
        instructionText={t('scratch.scratchHere')}
        hiddenContent={
          <div className="scratch-reveal-content">
            <h2 className="scratch-reveal-title">{text.resultTitle}</h2>
            {text.resultSubtitle && <p className="scratch-reveal-subtitle">{text.resultSubtitle}</p>}
            <p className="scratch-reveal-text">{scratch.revealText}</p>
            {scratch.revealSubtitle && <p className="scratch-reveal-detail">{scratch.revealSubtitle}</p>}
          </div>
        }
        revealThreshold={50}
        onReveal={handleReveal}
        onFirstTouch={handleFirstTouch}
        aspectRatio="16/10"
      />
      {showConfetti && (
        <div className="scratch-experience-confetti">
          <Confetti count={40} />
        </div>
      )}
    </div>
  );
}
