import React, { useContext, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import AnimatedPrimaryButton from './AnimatedPrimaryButton';
import RewardRevealAnimation from './RewardRevealAnimation';
import { HideRewardModalShopCtaContext } from '../ExperienceRewardCtaContext';
import { trackEvent } from '../../api/analyticsApi';
import './RewardModal.css';

export interface RewardModalProps {
  title: string;
  description?: string | null;
  discountCode: string | null;
  ctaUrl: string;
  ctaLabel: string;
  copyLabel: string;
  copiedLabel: string;
  shopId?: string;
  gameMode: string;
  extraActions?: React.ReactNode;
  onCtaClick?: () => void;
}

export default function RewardModal({
  title,
  description,
  discountCode,
  ctaUrl,
  ctaLabel,
  copyLabel,
  copiedLabel,
  shopId,
  gameMode,
  extraActions,
  onCtaClick,
}: RewardModalProps) {
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();
  const hideShopCta = useContext(HideRewardModalShopCtaContext);

  const handleCopy = async () => {
    if (!discountCode) return;
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      if (shopId) trackEvent(shopId, 'code_copied', { mode: gameMode, couponCode: discountCode });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleCta = () => {
    if (shopId) trackEvent(shopId, 'cta_clicked', { mode: gameMode, couponCode: discountCode ?? undefined });
    onCtaClick?.();
  };

  return (
    <RewardRevealAnimation sparkles className="tw-reward-modal">
      <div className="tw-reward-modal__card tw-reward-modal__card--glow">
        <h3 className="tw-reward-modal__title">{title}</h3>
        {description ? <p className="tw-reward-modal__desc">{description}</p> : null}
        {discountCode ? <code className="tw-reward-modal__code">{discountCode}</code> : null}
        <div className="tw-reward-modal__actions">
          {discountCode ? (
            <>
              <AnimatedPrimaryButton type="button" variant="secondary" block onClick={handleCopy}>
                {copyLabel}
              </AnimatedPrimaryButton>
              <motion.p
                className="tw-reward-modal__copy-hint"
                role="status"
                animate={copied && !reduceMotion ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {copied ? copiedLabel : '\u00a0'}
              </motion.p>
            </>
          ) : null}
          {!hideShopCta ? (
            <AnimatedPrimaryButton href={ctaUrl} external block pulse onClick={handleCta}>
              {ctaLabel}
            </AnimatedPrimaryButton>
          ) : null}
          {extraActions}
        </div>
      </div>
    </RewardRevealAnimation>
  );
}
