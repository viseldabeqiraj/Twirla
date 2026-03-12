/**
 * Catch the Prize – falling-item micro-game types.
 */

export type FallingItemKind = 'heart' | 'gift' | 'bomb' | 'star' | 'gem';

export interface FallingItem {
  id: number;
  kind: FallingItemKind;
  /** Horizontal position as percentage (0–100) of play area width. */
  x: number;
  /** Vertical position as percentage (0–100) from top. */
  y: number;
  removed: boolean;
  /** Points to add (positive) or subtract (negative) on tap. */
  points: number;
}

export interface FloatingScore {
  id: number;
  text: string;
  x: number;
  y: number;
  positive: boolean;
  createdAt: number;
}

export type GamePhase = 'idle' | 'countdown' | 'playing' | 'ended';

export interface CatchPrizeGameState {
  phase: GamePhase;
  /** Countdown step: 3, 2, 1, 0 (0 = "Go!") */
  countdownStep: number;
  /** Seconds left in play (20 down to 0). */
  timeLeft: number;
  score: number;
  /** 1 or 2 when star multiplier is active. */
  multiplier: number;
  /** Timestamp when multiplier ends. */
  multiplierUntil: number;
  items: FallingItem[];
  floatingScores: FloatingScore[];
  /** Next id for items. */
  nextItemId: number;
  /** Next id for floating scores. */
  nextFloatId: number;
  /** Consecutive non-bomb catches for combo bonus. */
  comboCount: number;
}

export const GAME_DURATION_MS = 20000;
export const COUNTDOWN_STEPS = [3, 2, 1, 0] as const;
export const FALL_SPEED_PCT_PER_MS = 0.028;
export const SPAWN_INTERVAL_MS = 650;
/** Fall speed multiplier at start of round */
export const FALL_SPEED_START = 1;
/** Fall speed multiplier at end of round (harder) */
export const FALL_SPEED_END = 2.2;
/** Spawn interval (ms) at start – slower spawn */
export const SPAWN_INTERVAL_START_MS = 650;
/** Spawn interval (ms) at end – faster spawn */
export const SPAWN_INTERVAL_END_MS = 320;
export const ITEM_SIZE_PCT = 12;
export const MULTIPLIER_DURATION_MS = 2000;

export const ITEM_POINTS: Record<FallingItemKind, number> = {
  heart: 1,
  gift: 3,
  bomb: -2,
  star: 0,
  gem: 12,
};
