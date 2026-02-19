/**
 * Tracks when a user last played a shop's experience
 * Uses localStorage to persist across sessions
 */

const STORAGE_PREFIX = 'twirla_play_';

export interface PlayStatus {
  canPlay: boolean;
  lastPlayTime: number | null;
  hoursRemaining: number | null;
}

/**
 * Check if user can play based on cooldown period
 */
export function canUserPlay(shopId: string, cooldownHours: number = 24): PlayStatus {
  const storageKey = `${STORAGE_PREFIX}${shopId}`;
  const lastPlayStr = localStorage.getItem(storageKey);
  
  if (!lastPlayStr) {
    return {
      canPlay: true,
      lastPlayTime: null,
      hoursRemaining: null
    };
  }
  
  const lastPlayTime = parseInt(lastPlayStr, 10);
  const now = Date.now();
  const hoursSincePlay = (now - lastPlayTime) / (1000 * 60 * 60);
  const hoursRemaining = cooldownHours - hoursSincePlay;
  
  return {
    canPlay: hoursRemaining <= 0,
    lastPlayTime,
    hoursRemaining: hoursRemaining > 0 ? Math.ceil(hoursRemaining) : null
  };
}

/**
 * Record that user has played
 */
export function recordPlay(shopId: string): void {
  const storageKey = `${STORAGE_PREFIX}${shopId}`;
  localStorage.setItem(storageKey, Date.now().toString());
}

/**
 * Clear play history for a shop (for testing)
 */
export function clearPlayHistory(shopId: string): void {
  const storageKey = `${STORAGE_PREFIX}${shopId}`;
  localStorage.removeItem(storageKey);
}

