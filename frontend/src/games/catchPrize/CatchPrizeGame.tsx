import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { useCatchPrizeGame } from './useCatchPrizeGame';
import type { FallingItemKind } from './catchPrize.types';
import type { TapHeartsOutcome } from '../../types/ShopConfig';
import Confetti from '../../components/Confetti';
import GameStatsBar from '../../components/twirla-ui/GameStatsBar';
import PrimaryButton from '../../components/twirla-ui/PrimaryButton';
import RewardModal from '../../components/twirla-ui/RewardModal';
import { trackEvent } from '../../api/analyticsApi';
import { generateDiscountCode, persistRewardCodeMeta } from '../../utils/discountCode';
import { normalizeTapHeartsReward } from '../../utils/rewardConsolation';
import '../../components/GameStats.css';
import './CatchPrizeGame.css';

const EMOJI: Record<FallingItemKind, string> = {
  heart: '❤️',
  gift: '🎁',
  bomb: '💣',
  star: '⭐',
  gem: '💎',
};

interface CatchPrizeGameProps {
  outcomes?: TapHeartsOutcome[];
  ctaLabel?: string;
  ctaUrl?: string;
  primaryColor?: string;
  shopId?: string;
  shopSlug?: string;
  gameMode?: string;
  onGameStart?: () => void;
}

export default function CatchPrizeGame({
  outcomes,
  ctaLabel,
  ctaUrl = '#',
  primaryColor = 'var(--primary-color, #db2777)',
  shopId,
  shopSlug,
  gameMode = 'TapHearts',
  onGameStart,
}: CatchPrizeGameProps) {
  const { t } = useTranslation();
  const playAreaRef = useRef<HTMLDivElement>(null);
  const { state, startCountdown, handleTap, tryAgain } = useCatchPrizeGame(outcomes);
  const hasFiredStart = useRef(false);
  const [finishCode, setFinishCode] = useState<string | null>(null);
  const finishTrackedRef = useRef(false);

  const displayOutcome = useMemo(
    () => (state.endOutcome ? normalizeTapHeartsReward(state.endOutcome, t) : null),
    [state.endOutcome, t]
  );

  useEffect(() => {
    if (state.phase === 'playing' && !hasFiredStart.current) {
      hasFiredStart.current = true;
      onGameStart?.();
    }
  }, [state.phase, onGameStart]);

  useEffect(() => {
    if (state.phase !== 'ended' || !displayOutcome) {
      finishTrackedRef.current = false;
      setFinishCode(null);
      return;
    }
    if (finishTrackedRef.current) return;
    finishTrackedRef.current = true;
    const sid = shopId ?? 'DEMO';
    const slug = shopSlug ?? sid;
    const code = generateDiscountCode({ shopSlug: slug, shopId: sid, gameMode });
    setFinishCode(code);
    if (shopId) {
      persistRewardCodeMeta({ code, generatedAt: Date.now(), shopId, game: gameMode });
      trackEvent(shopId, 'game_finish', { mode: gameMode });
      trackEvent(shopId, 'reward_won', { mode: gameMode });
      trackEvent(shopId, 'reward_generated', { mode: gameMode, couponCode: code });
    }
  }, [state.phase, displayOutcome, shopId, shopSlug, gameMode]);

  const onPlayAreaPointer = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const el = playAreaRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      handleTap(e.clientX, e.clientY, rect);
    },
    [handleTap]
  );

  const handleTryAgain = () => {
    hasFiredStart.current = false;
    finishTrackedRef.current = false;
    setFinishCode(null);
    tryAgain();
  };

  return (
    <div className="catch-prize-game" style={{ '--catch-primary': primaryColor } as React.CSSProperties}>
      {state.phase === 'idle' && (
        <div className="catch-prize-intro">
          <h2 className="catch-prize-title">{t('catchPrize.title')}</h2>
          <p className="catch-prize-instruction">{t('catchPrize.instruction')}</p>
          <PrimaryButton type="button" block pulse onClick={startCountdown}>
            {t('catchPrize.start')}
          </PrimaryButton>
        </div>
      )}

      {(state.phase === 'countdown' || state.phase === 'playing') && (
        <>
          {state.phase === 'countdown' && (
            <div className="catch-prize-countdown-overlay">
              <span className="catch-prize-countdown-num">
                {state.countdownStep === 0 ? t('catchPrize.go') : state.countdownStep}
              </span>
            </div>
          )}
          <GameStatsBar
            items={[
              { label: t('catchPrize.score'), value: String(state.score) },
              {
                label: t('catchPrize.timer'),
                value: `${Math.ceil(state.timeLeft)}s`,
                urgent: state.timeLeft <= 5,
              },
            ]}
          />
          {state.multiplier > 1 && (
            <p className="catch-prize-multiplier">{t('catchPrize.multiplierActive')}</p>
          )}
          {state.comboCount > 0 && (
            <p className="catch-prize-combo">Combo ×{state.comboCount}</p>
          )}
          <div
            ref={playAreaRef}
            className="catch-prize-play-area"
            onPointerDown={onPlayAreaPointer}
            role="button"
            tabIndex={0}
            aria-label={t('catchPrize.tapToCatch')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
            }}
          >
            {state.items.map(
              (item) =>
                !item.removed && (
                  <div
                    key={item.id}
                    className={`catch-prize-item catch-prize-item--${item.kind}`}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                    }}
                  >
                    {EMOJI[item.kind]}
                  </div>
                )
            )}
            {state.floatingScores.map((f) => (
              <span
                key={f.id}
                className={`catch-prize-float ${f.positive ? 'positive' : 'negative'}`}
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
              >
                {f.text}
              </span>
            ))}
          </div>
        </>
      )}

      {state.phase === 'ended' && displayOutcome && (
        <div className="catch-prize-ended">
          <Confetti count={28} />
          <h2 className="catch-prize-gameover">{t('catchPrize.gameOver')}</h2>
          <RewardModal
            title={displayOutcome.headline}
            description={displayOutcome.description}
            discountCode={finishCode}
            ctaUrl={ctaUrl}
            ctaLabel={ctaLabel ?? t('catchPrize.claimReward')}
            copyLabel={t('campaign.copyCode')}
            copiedLabel={t('reward.copied')}
            shopId={shopId}
            gameMode={gameMode}
            extraActions={
              <PrimaryButton type="button" variant="ghost" block onClick={handleTryAgain}>
                {t('catchPrize.tryAgain')}
              </PrimaryButton>
            }
          />
        </div>
      )}
    </div>
  );
}
