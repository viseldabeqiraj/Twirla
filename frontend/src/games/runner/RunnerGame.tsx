import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import type { RunnerGameConfig } from './runnerTypes';
import { DEFAULT_RUNNER_OUTCOMES, DEFAULT_RUNNER_THEME } from './runnerTypes';
import { useRunnerGame, type RunnerFrameState } from './useRunnerGame';
import { drawRunnerFrame } from './runnerDraw';
import Confetti from '../../components/Confetti';
import PrimaryButton from '../../components/twirla-ui/PrimaryButton';
import RewardModal from '../../components/twirla-ui/RewardModal';
import { trackEvent } from '../../api/analyticsApi';
import { generateDiscountCode, persistRewardCodeMeta } from '../../utils/discountCode';
import { normalizeRunnerReward } from '../../utils/rewardConsolation';
import { REWARD_PROGRESS_TARGET } from './runnerConstants';
import '../../components/GameStats.css';
import './RunnerGame.css';

export interface RunnerGameProps {
  config?: Partial<RunnerGameConfig>;
  shopId?: string;
  shopSlug?: string;
  experienceMode?: string;
}

export default function RunnerGame(props: RunnerGameProps) {
  const { t } = useTranslation();
  const defaultConfig: RunnerGameConfig = {
    outcomes: DEFAULT_RUNNER_OUTCOMES,
    theme: DEFAULT_RUNNER_THEME,
    ctaLabel: t('runner.claimReward'),
    ctaUrl: '#',
    title: t('runner.title'),
    instruction: t('runner.instruction'),
  };
  const config = { ...defaultConfig, ...props.config };
  const theme = config.theme ?? DEFAULT_RUNNER_THEME;
  const outcomes = config.outcomes ?? DEFAULT_RUNNER_OUTCOMES;
  const shopId = props.shopId;
  const shopSlug = props.shopSlug ?? shopId;
  const gameMode = props.experienceMode ?? 'Runner';

  const {
    state,
    canvasRef,
    startGame,
    jump,
    gameLoop,
    setDrawCallback,
    runningRef,
  } = useRunnerGame({
    outcomes,
  });

  const displayReward = useMemo(
    () => (state.reward ? normalizeRunnerReward(state.reward, t) : null),
    [state.reward, t]
  );

  const rafRef = useRef<number>(0);
  const [replayFading, setReplayFading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const prevScoreRef = useRef(0);
  const [scorePop, setScorePop] = useState(false);
  const [finishCode, setFinishCode] = useState<string | null>(null);
  const finishTrackedRef = useRef(false);

  useEffect(() => {
    if (state.uiState === 'gameover') {
      setIsShaking(true);
      const id = setTimeout(() => setIsShaking(false), 400);
      return () => clearTimeout(id);
    }
  }, [state.uiState]);

  useEffect(() => {
    if (state.uiState === 'playing' && state.score > prevScoreRef.current && state.score > 0) {
      setScorePop(true);
      const id = setTimeout(() => setScorePop(false), 500);
      return () => clearTimeout(id);
    }
    prevScoreRef.current = state.score;
  }, [state.score, state.uiState]);

  useEffect(() => {
    if (state.uiState !== 'gameover') {
      finishTrackedRef.current = false;
      setFinishCode(null);
      return;
    }
    if (!displayReward || finishTrackedRef.current) return;
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
  }, [state.uiState, displayReward, shopId, shopSlug, gameMode]);

  const handleReplay = useCallback(() => {
    setReplayFading(true);
    setTimeout(() => {
      finishTrackedRef.current = false;
      setFinishCode(null);
      startGame();
      setReplayFading(false);
    }, 280);
  }, [startGame]);

  const draw = useCallback(
    (frame: RunnerFrameState) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
      drawRunnerFrame(ctx, frame, theme);
    },
    [canvasRef, theme]
  );

  useEffect(() => {
    setDrawCallback(draw);
  }, [setDrawCallback, draw]);

  useEffect(() => {
    if (state.uiState !== 'playing') return;
    const loop = () => {
      if (!runningRef.current) return;
      gameLoop();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.uiState, gameLoop, runningRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [canvasRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (state.uiState === 'playing') jump();
    },
    [state.uiState, jump]
  );

  const handleCanvasTouch = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (state.uiState === 'playing') jump();
    },
    [state.uiState, jump]
  );

  const progressPct = Math.min(100, Math.round((state.score / REWARD_PROGRESS_TARGET) * 100));
  const progressCaption =
    state.uiState === 'playing'
      ? t('runner.rewardProgressLine', {
          current: String(Math.min(state.score, REWARD_PROGRESS_TARGET)),
          target: String(REWARD_PROGRESS_TARGET),
          percent: String(progressPct),
        })
      : null;

  const handleStartGame = useCallback(() => {
    if (shopId) trackEvent(shopId, 'game_start', { mode: gameMode });
    startGame();
  }, [shopId, gameMode, startGame]);

  return (
    <div
      className="runner-game"
      style={
        {
          '--runner-bg': theme.background ?? DEFAULT_RUNNER_THEME.background,
          '--runner-accent': theme.accent ?? DEFAULT_RUNNER_THEME.accent,
          '--runner-highlight': theme.highlight ?? DEFAULT_RUNNER_THEME.highlight,
        } as React.CSSProperties
      }
    >
      <div className="runner-game-card">
        {state.uiState === 'intro' && (
          <div className="runner-intro runner-state-enter">
            <div className="runner-intro-preview" aria-hidden="true">
              <div className="runner-intro-character">
                <span className="runner-intro-eye runner-intro-eye-left" />
                <span className="runner-intro-eye runner-intro-eye-right" />
              </div>
              <div className="runner-intro-ground" />
              <div className="runner-intro-obstacle" />
            </div>
            <h2 className="runner-title">{config.title}</h2>
            <p className="runner-instruction">{config.instruction}</p>
            <p className="runner-reward-hint">{t('runner.rewardHint')}</p>
            <PrimaryButton type="button" block pulse onClick={handleStartGame}>
              {t('runner.start')}
            </PrimaryButton>
          </div>
        )}

        {state.uiState === 'playing' && (
          <div className="runner-playing runner-state-enter">
            <div className={`runner-score-bubble ${scorePop ? 'runner-score-pop' : ''}`}>
              <span className="game-stat-label runner-score-bubble-label">{t('runner.score')}</span>
              <span className="game-stat-value runner-score-bubble-value">{state.score}</span>
              {scorePop && <span className="runner-plus-one">+1</span>}
            </div>
            {progressCaption ? (
              <div className="runner-next-threshold" aria-live="polite">
                <p className="runner-threshold-progress">{progressCaption}</p>
                <div className="runner-threshold-track" aria-hidden>
                  <div className="runner-threshold-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            ) : null}
            <div
              className="runner-canvas-wrap"
              role="button"
              tabIndex={0}
              onClick={handleCanvasClick}
              onTouchStart={handleCanvasTouch}
              onTouchEnd={(e) => e.preventDefault()}
              aria-label={t('runner.tapToJump')}
            >
              <canvas ref={canvasRef} className="runner-canvas" />
            </div>
          </div>
        )}

        {state.uiState === 'gameover' && displayReward && (
          <div
            className={`runner-gameover runner-state-enter ${replayFading ? 'runner-replay-fade' : ''} ${isShaking ? 'runner-shake' : ''}`}
          >
            <Confetti count={22} />
            <h2 className="runner-gameover-title">{t('runner.gameOver')}</h2>
            <RewardModal
              title={displayReward.headline}
              description={displayReward.body ?? undefined}
              discountCode={finishCode}
              ctaUrl={config.ctaUrl || '#'}
              ctaLabel={config.ctaLabel ?? t('runner.claimReward')}
              copyLabel={t('campaign.copyCode')}
              copiedLabel={t('reward.copied')}
              shopId={shopId}
              gameMode={gameMode}
              extraActions={
                <PrimaryButton type="button" variant="ghost" block onClick={handleReplay}>
                  {t('runner.playAgain')}
                </PrimaryButton>
              }
            />
            <p className="runner-gameover-run-score">{t('runner.runScore', { n: state.score })}</p>
            <p className="runner-gameover-best">
              {t('runner.best')}: {state.bestScore}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
