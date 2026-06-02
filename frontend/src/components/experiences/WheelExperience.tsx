import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { recordPlay } from '../../utils/playTracking';
import { trackEvent } from '../../api/analyticsApi';
import { useTranslation } from '../../i18n/i18n';
import RewardCelebration from '../RewardCelebration';
import RewardModal from '../twirla-ui/RewardModal';
import PrimaryButton from '../twirla-ui/PrimaryButton';
import { generateDiscountCode, persistRewardCodeMeta } from '../../utils/discountCode';
import GesturePrizeWheel, { buildWheelSegmentColors } from './GesturePrizeWheel';
import './WheelExperience.css';

interface WheelExperienceProps {
  config: ShopConfig;
}

export default function WheelExperience({ config }: WheelExperienceProps) {
  const wheel = config.wheel;
  const { shopId } = config;
  const { t } = useTranslation();
  const [hasSpun, setHasSpun] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [awaitingReveal, setAwaitingReveal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showBlockedTooltip, setShowBlockedTooltip] = useState(false);
  const [hintShake, setHintShake] = useState(false);
  const hasTrackedFinish = useRef(false);
  const [finishCode, setFinishCode] = useState<string | null>(null);
  const rewardTrackedRef = useRef(false);
  const [wheelSize, setWheelSize] = useState(260);

  const isWinningPrize = useCallback(
    (prizeLabel: string): boolean => {
      if (!wheel) return true;
      const prize = wheel.prizes.find((p) => p.label === prizeLabel);
      if (!prize) return true;

      if (prize.isWinning !== undefined && prize.isWinning !== null) {
        return prize.isWinning;
      }

      const losingPatterns = [
        'try again',
        'better luck',
        'no prize',
        'nothing',
        'unlucky',
        'sorry',
        'no win',
        'not this time',
        'visit us another time',
        'try again tomorrow',
        'provo përsëri nesër',
        'not this round',
        'jo në këtë raund',
      ];
      const labelLower = prizeLabel.toLowerCase().trim();
      const isLosing = losingPatterns.includes(labelLower);
      return !isLosing;
    },
    [wheel],
  );

  useEffect(() => {
    const computeSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const byWidth = Math.min(288, Math.max(200, width - 52));
      const chrome = width <= 768 ? 418 : 388;
      const byHeight = Math.max(168, height - chrome);
      setWheelSize(Math.min(byWidth, byHeight));
    };
    computeSize();
    window.addEventListener('resize', computeSize);
    return () => window.removeEventListener('resize', computeSize);
  }, []);

  useEffect(() => {
    if (!wheel) return;
    if (!showResult || !selectedPrize) {
      rewardTrackedRef.current = false;
      setFinishCode(null);
      return;
    }
    if (rewardTrackedRef.current) return;
    rewardTrackedRef.current = true;

    const won = isWinningPrize(selectedPrize);
    trackEvent(shopId, 'game_finish', { mode: 'Wheel' });

    if (!won) {
      setFinishCode(null);
      return;
    }

    const code = generateDiscountCode({
      shopSlug: config.slug ?? shopId,
      shopId,
      gameMode: 'Wheel',
    });
    setFinishCode(code);
    persistRewardCodeMeta({ code, generatedAt: Date.now(), shopId, game: 'Wheel' });
    trackEvent(shopId, 'reward_won', { mode: 'Wheel' });
    trackEvent(shopId, 'reward_generated', { mode: 'Wheel', couponCode: code });
  }, [showResult, selectedPrize, shopId, config.slug, wheel, isWinningPrize]);

  /** Wire from play-status API later; keep branch reachable for TypeScript. */
  const cooldownBlocked = false;
  const cooldownHoursRemaining: number | null = null;

  const labels = useMemo(() => wheel?.prizes.map((p) => p.label) ?? [], [wheel]);

  const segColors = useMemo(
    () =>
      wheel
        ? buildWheelSegmentColors(
            wheel.prizes.length,
            config.branding.primaryColor,
            config.branding.secondaryColor,
            config.branding.accentColor,
          )
        : [],
    [
      wheel,
      config.branding.primaryColor,
      config.branding.secondaryColor,
      config.branding.accentColor,
    ],
  );

  const pickWinnerIndex = useCallback(() => {
    if (!wheel) return 0;
    const totalWeight = wheel.prizes.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < wheel.prizes.length; i++) {
      random -= wheel.prizes[i].weight;
      if (random <= 0) return i;
    }
    return 0;
  }, [wheel]);

  const handleSpinStart = useCallback((): boolean => {
    if (!wheel) return false;
    if (cooldownBlocked) {
      setHintShake(true);
      setShowBlockedTooltip(true);
      setTimeout(() => setHintShake(false), 500);
      setTimeout(() => setShowBlockedTooltip(false), 3000);
      return false;
    }
    if (hasSpun && !wheel.allowRepeatSpins) {
      setHintShake(true);
      setShowBlockedTooltip(true);
      setTimeout(() => setHintShake(false), 500);
      setTimeout(() => setShowBlockedTooltip(false), 3000);
      return false;
    }
    setIsSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);
    setShowBlockedTooltip(false);
    hasTrackedFinish.current = false;
    trackEvent(shopId, 'game_start', { mode: 'Wheel' });
    return true;
  }, [cooldownBlocked, hasSpun, shopId, wheel]);

  const handleWheelSettled = useCallback(
    (winnerIndex: number) => {
      if (!wheel) return;
      const prize = wheel.prizes[winnerIndex];
      const label = prize?.label ?? wheel.prizes[0].label;
      setSelectedPrize(label);
      setIsSpinning(false);
      setAwaitingReveal(true);
      window.setTimeout(() => {
        setShowResult(true);
        setHasSpun(true);
        setAwaitingReveal(false);
        if (!hasTrackedFinish.current) {
          hasTrackedFinish.current = true;
        }
        recordPlay(shopId);
      }, 1700);
    },
    [shopId, wheel],
  );

  const resetRound = () => {
    setShowResult(false);
    setSelectedPrize(null);
    rewardTrackedRef.current = false;
    setFinishCode(null);
    hasTrackedFinish.current = false;
  };

  if (!wheel) return null;

  if (showResult && selectedPrize) {
    const isWinning = isWinningPrize(selectedPrize);
    const prize = wheel.prizes.find((p) => p.label === selectedPrize);

    const title = isWinning ? selectedPrize : t('wheel.noWinTitle');
    const description = isWinning
      ? prize?.description ?? undefined
      : `${t('wheel.noWinLanded', { label: selectedPrize })}\n\n${t('wheel.noWinMessage')}`;

    return (
      <RewardCelebration
        className={`wheel-result ${isWinning ? 'wheel-result-winning' : 'wheel-result-consolation'}`}
        celebrate={isWinning}
        confettiCount={40}
      >
        <RewardModal
          title={title}
          description={description}
          discountCode={finishCode}
          sparkles={isWinning}
          ctaUrl={config.cta.url}
          ctaLabel={config.text.ctaText}
          copyLabel={t('campaign.copyCode')}
          copiedLabel={t('reward.copied')}
          shopId={shopId}
          gameMode="Wheel"
          extraActions={
            <PrimaryButton type="button" variant="ghost" block onClick={resetRound}>
              {t('wheel.spinAgain')}
            </PrimaryButton>
          }
        />
      </RewardCelebration>
    );
  }

  if (cooldownBlocked) {
    const hoursText = cooldownHoursRemaining === 1 ? t('wheel.hour') : t('wheel.hours');
    return (
      <div className="wheel-message">
        <p>{t('wheel.alreadyPlayed')}</p>
        <p className="cooldown-message">
          {t('wheel.comeBackIn', {
            hours: cooldownHoursRemaining != null ? String(cooldownHoursRemaining) : '0',
            hoursText,
          })}
        </p>
      </div>
    );
  }

  if (hasSpun && !wheel.allowRepeatSpins) {
    return (
      <div className="wheel-message">
        <p>{t('wheel.thanksParticipating')}</p>
      </div>
    );
  }

  const wheelLocked = isSpinning || awaitingReveal;

  return (
    <div className={`wheel-container ${hintShake ? 'wheel-container--shake-hint' : ''}`}>
      <GesturePrizeWheel
        labels={labels}
        colors={segColors}
        size={wheelSize}
        disabled={wheelLocked}
        pickWinnerIndex={pickWinnerIndex}
        onSpinStart={handleSpinStart}
        onSettled={handleWheelSettled}
      />
      <p className={`wheel-drag-hint ${hintShake ? 'wheel-drag-hint--pulse' : ''}`}>{t('wheel.dragHint')}</p>
      <div className="wheel-prize-strip">
        {wheel.prizes.map((prize, idx) => (
          <span key={idx} className="wheel-prize-chip">
            {prize.label}
          </span>
        ))}
      </div>
      {showBlockedTooltip && <div className="blocked-tooltip">{t('wheel.thanksParticipating')}</div>}
    </div>
  );
}
