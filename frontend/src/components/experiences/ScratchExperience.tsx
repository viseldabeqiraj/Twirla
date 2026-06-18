import React, { useEffect, useRef, useState } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { useShopExperience } from '../../context/ShopExperienceContext';
import { trackEvent } from '../../api/analyticsApi';
import { useTranslation } from '../../i18n/i18n';
import RewardCelebration from '../RewardCelebration';
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
  const { markPlayed } = useShopExperience();
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

  const handleReveal = () => {
    setShowRewardPanel(true);
    trackEvent(shopId, 'game_finish', { mode: 'Scratch' });
    markPlayed();
  };

  const handleFirstTouch = () => {
    trackEvent(shopId, 'game_start', { mode: 'Scratch' });
  };

  const rewardTitle = scratch.revealText;
  const rewardDescription = scratch.revealSubtitle;

  if (showRewardPanel) {
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
        <RewardCelebration
          className="scratch-reward-panel wheel-result wheel-result-winning"
          confettiCount={40}
        >
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
        </RewardCelebration>
      </div>
    );
  }

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
            <p className="scratch-reveal-text">{scratch.revealText}</p>
            {scratch.revealSubtitle ? (
              <p className="scratch-reveal-detail">{scratch.revealSubtitle}</p>
            ) : null}
          </div>
        }
        revealThreshold={90}
        revealToModal
        onReveal={handleReveal}
        onFirstTouch={handleFirstTouch}
        aspectRatio="16/10"
      />
    </div>
  );
}
