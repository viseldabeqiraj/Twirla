import React, { useEffect, useRef, useState } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { recordPlay } from '../../utils/playTracking';
import { trackEvent } from '../../api/analyticsApi';
import { useTranslation } from '../../i18n/i18n';
import Confetti from '../Confetti';
import ScratchCard from '../ScratchCard';
import RewardModal from '../twirla-ui/RewardModal';
import { generateDiscountCode, persistRewardCodeMeta } from '../../utils/discountCode';
import './ScratchExperience.css';

interface ScratchExperienceProps {
  config: ShopConfig;
}

export default function ScratchExperience({ config }: ScratchExperienceProps) {
  const { scratch, text, shopId, branding, cta } = config;
  const { t } = useTranslation();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRewardPanel, setShowRewardPanel] = useState(false);
  const [finishCode, setFinishCode] = useState<string | null>(null);
  const rewardTrackedRef = useRef(false);

  useEffect(() => {
    if (!scratch || !showRewardPanel || rewardTrackedRef.current) return;
    rewardTrackedRef.current = true;
    const code = generateDiscountCode({
      shopSlug: config.slug ?? shopId,
      shopId,
      gameMode: 'Scratch',
    });
    setFinishCode(code);
    persistRewardCodeMeta({ code, generatedAt: Date.now(), shopId, game: 'Scratch' });
    trackEvent(shopId, 'reward_generated', { mode: 'Scratch', couponCode: code });
    trackEvent(shopId, 'reward_won', { mode: 'Scratch' });
  }, [scratch, showRewardPanel, shopId, config.slug]);

  if (!scratch) return null;

  const playStatus = { canPlay: true, hoursRemaining: null as number | null };

  const handleReveal = () => {
    setShowConfetti(true);
    setShowRewardPanel(true);
    trackEvent(shopId, 'game_finish', { mode: 'Scratch' });
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

  const rewardTitle = t('scratch.rewardPanelTitle');
  const rewardDescription = [scratch.revealText, scratch.revealSubtitle].filter(Boolean).join(' · ');

  return (
    <div
      className="scratch-experience-wrap"
      style={
        {
          '--scratch-primary': branding.primaryColor,
          '--scratch-secondary': branding.secondaryColor,
        } as React.CSSProperties
      }
    >
      <ScratchCard
        instructionText={t('scratch.scratchHere')}
        hiddenContent={
          <div className="scratch-reveal scratch-reveal-content">
            <h2 className="scratch-reveal-title">{t('scratch.revealedTitle')}</h2>
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
      {showRewardPanel ? (
        <div className="scratch-reward-panel">
          <RewardModal
            title={rewardTitle}
            description={rewardDescription}
            discountCode={finishCode}
            ctaUrl={cta.url}
            ctaLabel={text.ctaText}
            copyLabel={t('campaign.copyCode')}
            copiedLabel={t('reward.copied')}
            shopId={shopId}
            gameMode="Scratch"
          />
        </div>
      ) : null}
    </div>
  );
}
