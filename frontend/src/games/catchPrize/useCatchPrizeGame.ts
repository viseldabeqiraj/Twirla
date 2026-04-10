import { useCallback, useEffect, useRef, useState } from 'react';
import type { CatchPrizeGameState, FallingItem, FallingItemKind } from './catchPrize.types';
import {
  COUNTDOWN_STEPS,
  FALL_SPEED_PCT_PER_MS,
  ITEM_SIZE_PCT,
  MULTIPLIER_DURATION_MS,
  ITEM_POINTS,
  GAME_DURATION_MS,
  FALL_SPEED_START,
  FALL_SPEED_END,
  SPAWN_INTERVAL_START_MS,
  SPAWN_INTERVAL_END_MS,
} from './catchPrize.types';
import { pickCatchPrizeOutcome } from './rewardMapping';
import type { TapHeartsOutcome } from '../../types/ShopConfig';

const KINDS: FallingItemKind[] = ['heart', 'gift', 'bomb', 'star', 'gem'];
const WEIGHTS = [38, 18, 18, 14, 12]; // heart, gift, bomb, star, gem (gem = rare prize)
const COMBO_BONUS = 3;

function weightedRandomKind(): FallingItemKind {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < KINDS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return KINDS[i];
  }
  return 'heart';
}

const initialState: CatchPrizeGameState = {
  phase: 'idle',
  countdownStep: 0,
  timeLeft: 20,
  score: 0,
  multiplier: 1,
  multiplierUntil: 0,
  items: [],
  floatingScores: [],
  nextItemId: 1,
  nextFloatId: 1,
  comboCount: 0,
  endOutcome: null,
};

const TICK_MS = 50; // ~20 fps for game logic

export function useCatchPrizeGame(outcomes?: TapHeartsOutcome[]) {
  const [state, setState] = useState<CatchPrizeGameState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const outcomesRef = useRef(outcomes);
  outcomesRef.current = outcomes;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);
  const spawnAtRef = useRef<number>(0);
  const countdownEndRef = useRef<number>(0);
  const playStartRef = useRef<number>(0);
  const mountedRef = useRef(true);

  const addFloating = useCallback((text: string, x: number, y: number, positive: boolean) => {
    setState((prev) => ({
      ...prev,
      nextFloatId: prev.nextFloatId + 1,
      floatingScores: [
        ...prev.floatingScores,
        { id: prev.nextFloatId, text, x, y, positive, createdAt: Date.now() },
      ],
    }));
  }, []);

  const startCountdown = useCallback(() => {
    mountedRef.current = true;
    setState({
      ...initialState,
      phase: 'countdown',
      countdownStep: 3,
      timeLeft: 20,
    });
    countdownEndRef.current = Date.now() + 4000;
    // Start the game loop when we enter countdown (in case it wasn't running)
    if (!intervalRef.current) {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        const now = Date.now();
        const phase = stateRef.current.phase;
        if (phase === 'idle' || phase === 'ended') return;

        if (phase === 'countdown') {
          const countdownStart = countdownEndRef.current - 4000;
          const elapsed = now - countdownStart;
          const stepIndex = Math.min(Math.floor(elapsed / 1000), COUNTDOWN_STEPS.length - 1);
          const step = COUNTDOWN_STEPS[Math.min(stepIndex, COUNTDOWN_STEPS.length - 1)];
          setState((prev) => ({ ...prev, countdownStep: step }));
          if (elapsed >= 4000) {
            setState((prev) => ({
              ...prev,
              phase: 'playing',
              countdownStep: 0,
            }));
            playStartRef.current = now;
            spawnAtRef.current = now;
            lastTickRef.current = now;
          }
          return;
        }

        if (phase === 'playing') {
          const elapsed = now - playStartRef.current;
          const timeLeft = Math.max(0, GAME_DURATION_MS / 1000 - elapsed / 1000);
          if (timeLeft <= 0) {
            setState((prev) => ({
              ...prev,
              phase: 'ended',
              timeLeft: 0,
              endOutcome: pickCatchPrizeOutcome(outcomesRef.current),
            }));
            return;
          }
          const dt = now - lastTickRef.current;
          lastTickRef.current = now;
          // Ramp difficulty: faster fall and more frequent spawn over the 8s round
          const t = Math.min(1, elapsed / GAME_DURATION_MS);
          const fallSpeedMult = FALL_SPEED_START + t * (FALL_SPEED_END - FALL_SPEED_START);
          const spawnIntervalMs = SPAWN_INTERVAL_START_MS - t * (SPAWN_INTERVAL_START_MS - SPAWN_INTERVAL_END_MS);
          const shouldSpawn = now - spawnAtRef.current >= spawnIntervalMs;
          if (shouldSpawn) spawnAtRef.current = now;

          setState((prev) => {
            const mult = now <= prev.multiplierUntil ? 2 : 1;
            let items = prev.items.map((it) =>
              it.removed ? it : { ...it, y: it.y + FALL_SPEED_PCT_PER_MS * dt * fallSpeedMult }
            );
            items = items.filter((it) => !it.removed && it.y < 100 + ITEM_SIZE_PCT);
            if (shouldSpawn) {
              const kind = weightedRandomKind();
              items = [
                ...items,
                {
                  id: prev.nextItemId,
                  kind,
                  x: 15 + Math.random() * 70,
                  y: -ITEM_SIZE_PCT,
                  removed: false,
                  points: ITEM_POINTS[kind],
                } as FallingItem,
              ];
            }
            const maxAge = 800;
            const floatingScores = prev.floatingScores.filter((f) => now - f.createdAt < maxAge);
            return {
              ...prev,
              timeLeft,
              multiplier: mult,
              items,
              nextItemId: shouldSpawn ? prev.nextItemId + 1 : prev.nextItemId,
              floatingScores: floatingScores.length === prev.floatingScores.length ? prev.floatingScores : floatingScores,
            };
          });
        }
      }, TICK_MS);
    }
  }, []);

  const removeItem = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, removed: true } : it)),
    }));
  }, []);

  const hitTest = useCallback(
    (clientX: number, clientY: number, rect: DOMRect): FallingItem | null => {
      const { items } = stateRef.current;
      const xPct = ((clientX - rect.left) / rect.width) * 100;
      const yPct = ((clientY - rect.top) / rect.height) * 100;
      const half = ITEM_SIZE_PCT / 2;
      for (const item of items) {
        if (item.removed) continue;
        if (
          xPct >= item.x - half &&
          xPct <= item.x + half &&
          yPct >= item.y - half &&
          yPct <= item.y + half
        ) {
          return item;
        }
      }
      return null;
    },
    []
  );

  const handleTap = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const current = stateRef.current;
      if (current.phase !== 'playing') return;
      const item = hitTest(clientX, clientY, rect);
      if (!item) return;

      const now = Date.now();
      let mult = current.multiplier;
      if (now > current.multiplierUntil) mult = 1;

      const points = ITEM_POINTS[item.kind];
      if (item.kind === 'star') {
        setState((prev) => ({
          ...prev,
          multiplier: 2,
          multiplierUntil: now + MULTIPLIER_DURATION_MS,
        }));
        addFloating('2x', item.x, item.y, true);
        removeItem(item.id);
        return;
      }

      if (item.kind === 'bomb') {
        const applied = points;
        const rounded = Math.round(applied);
        setState((prev) => ({
          ...prev,
          score: Math.max(0, prev.score + rounded),
          comboCount: 0,
        }));
        addFloating(`${rounded}`, item.x, item.y, false);
        removeItem(item.id);
        return;
      }

      // heart, gift, gem: add points and possibly combo bonus
      const comboCount = current.comboCount + 1;
      const bonus = comboCount >= 3 ? COMBO_BONUS : 0;
      const applied = points * mult + bonus;
      const rounded = Math.round(applied);
      setState((prev) => ({
        ...prev,
        score: Math.max(0, prev.score + rounded),
        comboCount: bonus ? 0 : comboCount,
      }));
      addFloating(rounded >= 0 ? `+${rounded}` : `${rounded}`, item.x, item.y, true);
      if (bonus) addFloating('Combo!', item.x, item.y - 4, true);
      removeItem(item.id);
    },
    [hitTest, removeItem, addFloating]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const tryAgain = useCallback(() => {
    startCountdown();
  }, [startCountdown]);

  return {
    state,
    startCountdown,
    handleTap,
    tryAgain,
  };
}
