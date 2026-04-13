import type { RunnerGameOutcome, TapHeartsOutcome } from '../types/ShopConfig';

/** Default consolation percent when shop config yields a no-win (Twirla UX guarantee). */
export const DEFAULT_CONSOLATION_PERCENT = 5;

type Translate = (key: string, options?: Record<string, string | number>) => string;

export function normalizeRunnerReward(outcome: RunnerGameOutcome, t: Translate, pct = DEFAULT_CONSOLATION_PERCENT): RunnerGameOutcome {
  if (!outcome.isNoWin) return outcome;
  return {
    headline: t('reward.consolationHeadline', { pct: String(pct) }),
    body: t('reward.consolationSub', { pct: String(pct) }),
    weight: 0,
    isNoWin: false,
  };
}

export function normalizeTapHeartsReward(outcome: TapHeartsOutcome, t: Translate, pct = DEFAULT_CONSOLATION_PERCENT): TapHeartsOutcome {
  if (!outcome.isNoWin) return outcome;
  return {
    headline: t('reward.consolationHeadline', { pct: String(pct) }),
    description: t('reward.consolationSub', { pct: String(pct) }),
    weight: 0,
    isNoWin: false,
  };
}
