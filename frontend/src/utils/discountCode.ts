import type { ExperienceMode } from '../types/ShopConfig';

const CODE_YEAR = () => new Date().getFullYear();

function randomSuffix(length = 4): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

/** Uppercase A–Z0–9 only, max length */
export function sanitizeCodeSegment(raw: string, maxLen = 12): string {
  const u = (raw || 'SHOP').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return (u || 'SHOP').slice(0, maxLen);
}

export function gameModeToCodeSegment(mode: ExperienceMode | string | undefined): string {
  const m = String(mode || 'GAME').replace(/[^a-z0-9]/gi, '');
  const map: Record<string, string> = {
    runner: 'RUNNER',
    wheel: 'WHEEL',
    taphearts: 'TAP',
    scratch: 'SCRATCH',
    countdown: 'COUNTDOWN',
    memorymatch: 'MEMORY',
  };
  const key = m.toLowerCase();
  return map[key] || sanitizeCodeSegment(m, 10);
}

export interface DiscountCodeParams {
  shopSlug: string;
  shopId: string;
  gameMode: ExperienceMode | string;
}

/**
 * TWIRLA-{YEAR}-{SHOP}-{GAME}-{RANDOM}
 */
export function generateDiscountCode(params: DiscountCodeParams): string {
  const year = CODE_YEAR();
  const shop = sanitizeCodeSegment(params.shopSlug || params.shopId);
  const game = gameModeToCodeSegment(params.gameMode);
  return `TWIRLA-${year}-${shop}-${game}-${randomSuffix(4)}`;
}

const STORAGE_PREFIX = 'twirla_reward_code_';

export interface StoredRewardCode {
  code: string;
  generatedAt: number;
  shopId: string;
  game: string;
}

export function persistRewardCodeMeta(record: StoredRewardCode): void {
  try {
    const key = `${STORAGE_PREFIX}${record.shopId}_${record.game}`;
    sessionStorage.setItem(key, JSON.stringify(record));
  } catch {
    /* ignore */
  }
}

export function readRewardCodeMeta(shopId: string, game: string): StoredRewardCode | null {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${shopId}_${game}`);
    if (!raw) return null;
    return JSON.parse(raw) as StoredRewardCode;
  } catch {
    return null;
  }
}
