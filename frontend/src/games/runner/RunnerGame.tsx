import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import type { RunnerGameConfig } from './runnerTypes';
import { DEFAULT_REWARD_TIERS, DEFAULT_RUNNER_THEME } from './runnerTypes';
import { useRunnerGame, type RunnerFrameState } from './useRunnerGame';
import { drawRunnerFrame } from './runnerDraw';
import { getNextThreshold } from './runnerRewards';
import Confetti from '../../components/Confetti';
import './RunnerGame.css';

export default function RunnerGame(props: { config?: Partial<RunnerGameConfig> }) {
  const { t } = useTranslation();
  const defaultConfig: RunnerGameConfig = {
    rewardTiers: DEFAULT_REWARD_TIERS,
    theme: DEFAULT_RUNNER_THEME,
    ctaLabel: t('runner.claimReward'),
    ctaUrl: '#',
    title: t('runner.title'),
    instruction: t('runner.instruction'),
  };
  const config = { ...defaultConfig, ...props.config };
  const theme = config.theme ?? DEFAULT_RUNNER_THEME;
  const rewardTiers = config.rewardTiers ?? DEFAULT_REWARD_TIERS;

  const {
    state,
    canvasRef,
    startGame,
    jump,
    gameLoop,
    setDrawCallback,
    runningRef,
  } = useRunnerGame({
    rewardTiers,
  });

  const rafRef = useRef<number>(0);
  const [replayFading, setReplayFading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const prevScoreRef = useRef(0);
  const [scorePop, setScorePop] = useState(false);
  const nextThreshold = getNextThreshold(state.score, rewardTiers);

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

  const handleReplay = useCallback(() => {
    setReplayFading(true);
    setTimeout(() => {
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
            <button
              type="button"
              className="runner-btn runner-btn-primary"
              onClick={startGame}
            >
              {t('runner.start')}
            </button>
          </div>
        )}

        {state.uiState === 'playing' && (
          <div className="runner-playing runner-state-enter">
            <div className={`runner-score-bubble ${scorePop ? 'runner-score-pop' : ''}`}>
              <span className="runner-score-bubble-label">{t('runner.score')}</span>
              <span className="runner-score-bubble-value">{state.score}</span>
              {scorePop && <span className="runner-plus-one">+1</span>}
            </div>
            {nextThreshold && (
              <div className="runner-next-threshold">
                <p className="runner-threshold-progress">
                  {t('runner.nextThresholdProgress', {
                    current: state.score,
                    target: nextThreshold.points,
                    reward: t(`runner.rewardShort.${nextThreshold.tierKey}`),
                  })}
                </p>
                <p className="runner-threshold-more">
                  {t('runner.moreFor', {
                    count: nextThreshold.points - state.score,
                    reward: t(`runner.rewardShort.${nextThreshold.tierKey}`),
                  })}
                </p>
              </div>
            )}
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

        {state.uiState === 'gameover' && (
          <div
            className={`runner-gameover runner-state-enter ${replayFading ? 'runner-replay-fade' : ''} ${isShaking ? 'runner-shake' : ''}`}
          >
            {state.reward && state.score >= 80 && <Confetti count={24} />}
            <h2 className="runner-gameover-title">{t('runner.gameOver')}</h2>
            <div className="runner-gameover-score-main">
              <span className="runner-gameover-score-value">{state.score}</span>
            </div>
            {state.reward && (
              <div className="runner-reward-unlocked">
                <p className="runner-reward-message">
                  {state.reward.tierKey
                    ? t(`runner.reward.${state.reward.tierKey}`)
                    : state.reward.message}
                </p>
              </div>
            )}
            <div className="runner-gameover-actions">
              <button
                type="button"
                className="runner-btn runner-btn-primary"
                onClick={handleReplay}
              >
                {t('runner.playAgain')}
              </button>
              {config.ctaUrl && (
                <a
                  href={config.ctaUrl}
                  className="runner-btn runner-btn-cta"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {config.ctaLabel}
                </a>
              )}
            </div>
            <p className="runner-gameover-best">
              {t('runner.best')}: {state.bestScore}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
