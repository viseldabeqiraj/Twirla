import { useCallback, useRef, useState } from 'react';
import type { RunnerGameOutcome } from '../../types/ShopConfig';
import { pickWeighted } from '../pickWeighted';
import {
  GRAVITY,
  JUMP_VELOCITY,
  INITIAL_SPEED,
  MAX_SPEED,
  WARMUP_SECONDS,
  SPEED_INCREASE_PER_SCORE,
  SPEED_INCREASE_PER_SECOND,
  GROUND_Y_RATIO,
  CHARACTER_WIDTH,
  CHARACTER_HEIGHT,
  CHARACTER_GROUND_OFFSET,
  SCORE_PER_FRAME,
  OBSTACLE_MIN_GAP,
} from './runnerConstants';
import { checkCollision, type Box } from './runnerCollision';
import { createObstacle, type Obstacle } from './runnerObstacles';
import { DEFAULT_RUNNER_OUTCOMES } from './runnerTypes';

export interface RunnerFrameState {
  characterY: number;
  velocityY: number;
  obstacles: Obstacle[];
  groundY: number;
  score: number;
  width: number;
  height: number;
  scorePopFrames: number;
}

const BEST_SCORE_KEY = 'twirla_runner_best';

export type RunnerUIState = 'intro' | 'playing' | 'gameover';

export interface RunnerGameState {
  uiState: RunnerUIState;
  score: number;
  bestScore: number;
  reward: RunnerGameOutcome | null;
}

export interface UseRunnerGameOptions {
  outcomes?: RunnerGameOutcome[];
  onGameOver?: (score: number, bestScore: number, reward: RunnerGameOutcome) => void;
}

export function useRunnerGame(options: UseRunnerGameOptions = {}) {
  const outcomesRef = useRef(options.outcomes);
  outcomesRef.current = options.outcomes;
  const onGameOverRef = useRef(options.onGameOver);
  onGameOverRef.current = options.onGameOver;

  const [state, setState] = useState<RunnerGameState>({
    uiState: 'intro',
    score: 0,
    bestScore: parseInt(localStorage.getItem(BEST_SCORE_KEY) || '0', 10),
    reward: null,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const characterYRef = useRef(0);
  const velocityYRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const speedRef = useRef(INITIAL_SPEED);
  const lastSpawnXRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const groundYRef = useRef(0);
  const runningRef = useRef(false);
  const onFrameRef = useRef<((frame: RunnerFrameState) => void) | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const scorePopFramesRef = useRef(0);
  const lastScoreIntRef = useRef(0);
  /** Cumulative score at the moment warmup ends — speed ramp only counts points after this */
  const postWarmupScoreBaselineRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    runningRef.current = true;
    characterYRef.current = 0;
    velocityYRef.current = 0;
    obstaclesRef.current = [];
    speedRef.current = INITIAL_SPEED;
    lastSpawnXRef.current = null;
    scoreRef.current = 0;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      groundYRef.current = rect.height * GROUND_Y_RATIO - CHARACTER_HEIGHT - CHARACTER_GROUND_OFFSET;
      characterYRef.current = groundYRef.current;
    }
    gameStartTimeRef.current = performance.now();
    scorePopFramesRef.current = 0;
    lastScoreIntRef.current = 0;
    postWarmupScoreBaselineRef.current = null;
    setState((s) => ({
      ...s,
      uiState: 'playing',
      score: 0,
      reward: null,
    }));
  }, []);

  const jump = useCallback(() => {
    if (state.uiState !== 'playing') return;
    const groundY = groundYRef.current;
    const charY = characterYRef.current;
    const vy = velocityYRef.current;
    const nearGround = charY >= groundY - 10;
    const notAlreadyJumping = vy >= -5;
    if (nearGround && notAlreadyJumping) {
      velocityYRef.current = JUMP_VELOCITY;
    }
  }, [state.uiState]);

  const endGame = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    const score = Math.floor(scoreRef.current);
    const best = Math.max(score, state.bestScore);
    localStorage.setItem(BEST_SCORE_KEY, String(best));
    const list =
      outcomesRef.current && outcomesRef.current.length > 0
        ? outcomesRef.current
        : DEFAULT_RUNNER_OUTCOMES;
    const reward = pickWeighted(list);
    onGameOverRef.current?.(score, best, reward);
    setState((s) => ({
      ...s,
      uiState: 'gameover',
      score,
      bestScore: best,
      reward,
    }));
  }, [state.bestScore]);

  const setDrawCallback = useCallback((cb: ((frame: RunnerFrameState) => void) | null) => {
    onFrameRef.current = cb;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !runningRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const groundY = h * GROUND_Y_RATIO - CHARACTER_HEIGHT - CHARACTER_GROUND_OFFSET;
    groundYRef.current = groundY;

    if (scoreRef.current === 0 && characterYRef.current === 0) {
      characterYRef.current = groundY;
    }
    let charY = characterYRef.current;
    let vy = velocityYRef.current;
    let speed = speedRef.current;
    let obstacles = obstaclesRef.current;
    let score = scoreRef.current;

    charY += vy;
    vy += GRAVITY;
    if (charY >= groundY) {
      charY = groundY;
      vy = 0;
    }
    characterYRef.current = charY;
    velocityYRef.current = vy;
    score += SCORE_PER_FRAME;
    scoreRef.current = score;
    const scoreInt = Math.floor(score);
    if (scoreInt > lastScoreIntRef.current && scoreInt > 0) {
      scorePopFramesRef.current = 28;
    }
    lastScoreIntRef.current = scoreInt;
    if (scorePopFramesRef.current > 0) scorePopFramesRef.current--;

    const elapsedSec = (performance.now() - gameStartTimeRef.current) / 1000;
    const inWarmup = elapsedSec < WARMUP_SECONDS;
    if (!inWarmup && postWarmupScoreBaselineRef.current === null) {
      postWarmupScoreBaselineRef.current = score;
    }
    const warmElapsed = Math.max(0, elapsedSec - WARMUP_SECONDS);
    const scoreSinceWarmup =
      postWarmupScoreBaselineRef.current !== null
        ? Math.max(0, score - postWarmupScoreBaselineRef.current)
        : 0;
    const baseSpeed = inWarmup
      ? INITIAL_SPEED
      : INITIAL_SPEED +
        scoreSinceWarmup * SPEED_INCREASE_PER_SCORE +
        warmElapsed * SPEED_INCREASE_PER_SECOND;
    speed = Math.min(MAX_SPEED, baseSpeed);
    speedRef.current = speed;

    const charBox: Box = {
      x: 52,
      y: charY,
      width: CHARACTER_WIDTH,
      height: CHARACTER_HEIGHT,
    };

    const toRemove: number[] = [];
    obstacles.forEach((obs, i) => {
      obs.x -= speed;
      if (obs.x + obs.width < 0) toRemove.push(i);
      if (!obs.passed && obs.x + obs.width < charBox.x) {
        obs.passed = true;
      }
      const obsBox: Box = { x: obs.x, y: obs.y, width: obs.width, height: obs.height };
      if (checkCollision(charBox, obsBox)) {
        runningRef.current = false;
        endGame();
        return;
      }
    });
    obstaclesRef.current = obstacles.filter((_, i) => !toRemove.includes(i));

    const rightEdge = w + 80;
    const rightmostObstacle = obstacles.length
      ? Math.max(...obstacles.map((o) => o.x))
      : -9999;
    const minGap = OBSTACLE_MIN_GAP;
    const shouldSpawn =
      obstacles.length === 0 || rightmostObstacle < w - minGap;
    if (shouldSpawn) {
      const newObs = createObstacle(w, groundY + CHARACTER_HEIGHT + CHARACTER_GROUND_OFFSET);
      newObs.x = rightEdge;
      lastSpawnXRef.current = rightEdge;
      obstaclesRef.current = [...obstaclesRef.current, newObs];
    }

    setState((s) => {
      if (s.uiState !== 'playing') return s;
      return { ...s, score: Math.floor(score) };
    });

    onFrameRef.current?.({
      characterY: charY,
      velocityY: vy,
      obstacles: [...obstaclesRef.current],
      groundY,
      score,
      width: w,
      height: h,
      scorePopFrames: scorePopFramesRef.current,
    });
  }, [endGame]);

  return {
    state,
    canvasRef,
    startGame,
    jump,
    gameLoop,
    setDrawCallback,
    runningRef,
  };
}
