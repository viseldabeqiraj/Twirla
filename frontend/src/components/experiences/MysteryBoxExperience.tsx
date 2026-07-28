import React, { useEffect, useRef, useState } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { useShopExperience } from '../../context/ShopExperienceContext';
import { trackEvent } from '../../api/analyticsApi';
import { useTranslation } from '../../i18n/i18n';
import RewardCelebration from '../RewardCelebration';
import RewardModal from '../twirla-ui/RewardModal';
import { generateDiscountCode, persistRewardCodeMeta } from '../../utils/discountCode';
import './MysteryBoxExperience.css';

interface MysteryBoxExperienceProps {
  config: ShopConfig;
}

/**
 * Pick-a-gift game: the customer taps one of a few closed boxes; it opens and
 * reveals the reward. Pure luck, one tap — mirrors the Scratch flow (reward
 * modal + coupon code + analytics events) so it plugs into ExperienceHost.
 */
export default function MysteryBoxExperience({ config }: MysteryBoxExperienceProps) {
  const { mysteryBox, text, shopId, branding, cta } = config;
  const { t } = useTranslation();
  const { markPlayed } = useShopExperience();
  const [picked, setPicked] = useState<number | null>(null);
  const [showRewardPanel, setShowRewardPanel] = useState(false);
  const [finishCode, setFinishCode] = useState<string | null>(null);
  const rewardTrackedRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!mysteryBox || !showRewardPanel || rewardTrackedRef.current) return;
    rewardTrackedRef.current = true;
    const code = generateDiscountCode({
      shopSlug: config.slug ?? shopId,
      shopId,
      gameMode: 'MysteryBox',
    });
    setFinishCode(code);
    persistRewardCodeMeta({ code, generatedAt: Date.now(), shopId, game: 'MysteryBox' });
    trackEvent(shopId, 'reward_generated', { mode: 'MysteryBox', couponCode: code });
    trackEvent(shopId, 'reward_won', { mode: 'MysteryBox' });
  }, [mysteryBox, showRewardPanel, shopId, config.slug]);

  if (!mysteryBox) return null;

  const boxCount = Math.min(Math.max(mysteryBox.boxCount ?? 3, 2), 4);

  const handlePick = (index: number) => {
    if (picked !== null) return;
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent(shopId, 'game_start', { mode: 'MysteryBox' });
    }
    setPicked(index);
    trackEvent(shopId, 'game_finish', { mode: 'MysteryBox' });
    markPlayed();
    window.setTimeout(() => setShowRewardPanel(true), 650);
  };

  const styleVars = {
    '--mystery-primary': branding.primaryColor,
    '--mystery-secondary': branding.secondaryColor,
  } as React.CSSProperties;

  if (showRewardPanel) {
    return (
      <div className="mystery-experience-wrap" style={styleVars}>
        <RewardCelebration
          className="mystery-reward-panel wheel-result wheel-result-winning"
          confettiCount={40}
        >
          <RewardModal
            title={mysteryBox.revealText}
            description={mysteryBox.revealSubtitle}
            discountCode={finishCode}
            ctaUrl={cta.url}
            ctaLabel={text.ctaText}
            copyLabel={t('campaign.copyCode')}
            copiedLabel={t('reward.copied')}
            shopId={shopId}
            gameMode="MysteryBox"
          />
        </RewardCelebration>
      </div>
    );
  }

  return (
    <div className="mystery-experience-wrap" style={styleVars}>
      <div className="mystery-boxes">
        {Array.from({ length: boxCount }).map((_, index) => (
          <button
            key={index}
            type="button"
            className={
              'mystery-box' +
              (picked === index ? ' picked' : '') +
              (picked !== null && picked !== index ? ' dim' : '')
            }
            onClick={() => handlePick(index)}
            aria-label={t('mysteryBox.pick')}
          >
            <span className="mystery-box-emoji">{picked === index ? '🎉' : '🎁'}</span>
          </button>
        ))}
      </div>
      <p className="mystery-hint">{t('mysteryBox.hint')}</p>
    </div>
  );
}
