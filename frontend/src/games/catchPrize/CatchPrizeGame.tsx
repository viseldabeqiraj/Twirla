import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { useCatchPrizeGame } from './useCatchPrizeGame';
import type { FallingItemKind } from './catchPrize.types';
import Confetti from '../../components/Confetti';
import './CatchPrizeGame.css';

const EMOJI: Record<FallingItemKind, string> = {
  heart: '❤️',
  gift: '🎁',
  bomb: '💣',
  star: '⭐',
};

interface CatchPrizeGameProps {
  ctaLabel?: string;
  ctaUrl?: string;
  /** Primary color for accents */
  primaryColor?: string;
  /** Called when the user starts the game (after clicking Start). */
  onGameStart?: () => void;
  /** Called when the game ends with the final score. */
  onGameEnd?: (score: number) => void;
}

export default function CatchPrizeGame({
  ctaLabel,
  ctaUrl = '#',
  primaryColor = 'var(--primary-color, #db2777)',
  onGameStart,
  onGameEnd,
}: CatchPrizeGameProps) {
  const { t } = useTranslation();
  const playAreaRef = useRef<HTMLDivElement>(null);
  const { state, startCountdown, handleTap, rewardTier, tryAgain } = useCatchPrizeGame();
  const hasFiredStart = useRef(false);
  const hasFiredEnd = useRef(false);

  useEffect(() => {
    if (state.phase === 'playing' && !hasFiredStart.current) {
      hasFiredStart.current = true;
      onGameStart?.();
    }
  }, [state.phase, onGameStart]);

  useEffect(() => {
    if (state.phase === 'ended' && rewardTier && !hasFiredEnd.current) {
      hasFiredEnd.current = true;
      onGameEnd?.(state.score);
    }
  }, [state.phase, state.score, rewardTier, onGameEnd]);

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

  return (
    <div className="catch-prize-game" style={{ '--catch-primary': primaryColor } as React.CSSProperties}>
      {state.phase === 'idle' && (
        <div className="catch-prize-intro">
          <h2 className="catch-prize-title">{t('catchPrize.title')}</h2>
          <p className="catch-prize-instruction">{t('catchPrize.instruction')}</p>
          <button type="button" className="catch-prize-btn-start" onClick={startCountdown}>
            {t('catchPrize.start')}
          </button>
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
          <div className="catch-prize-hud">
            <span className="catch-prize-score">
              {t('catchPrize.score')}: <strong>{state.score}</strong>
            </span>
            <span className="catch-prize-timer">
              {t('catchPrize.timer')}: <strong>{Math.ceil(state.timeLeft)}s</strong>
            </span>
            {state.multiplier > 1 && (
              <span className="catch-prize-multiplier">{t('catchPrize.multiplierActive')}</span>
            )}
          </div>
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

      {state.phase === 'ended' && rewardTier && (
        <div className="catch-prize-ended">
          {rewardTier.key !== 'no_reward' && <Confetti count={30} />}
          <h2 className="catch-prize-gameover">{t('catchPrize.gameOver')}</h2>
          <p className="catch-prize-final-score">
            {t('catchPrize.score')}: <strong>{state.score}</strong>
          </p>
          <p className="catch-prize-reward-message">{t(rewardTier.messageKey)}</p>
          <div className="catch-prize-ended-actions">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="catch-prize-btn-cta"
            >
              {ctaLabel ?? t('catchPrize.claimReward')}
            </a>
            <button
            type="button"
            className="catch-prize-btn-retry"
            onClick={() => {
              hasFiredEnd.current = false;
              hasFiredStart.current = false;
              tryAgain();
            }}
          >
              {t('catchPrize.tryAgain')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
