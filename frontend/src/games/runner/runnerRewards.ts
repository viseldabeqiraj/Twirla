import type { RunnerRewardTier } from './runnerTypes';

export function getRewardForScore(
  score: number,
  tiers: RunnerRewardTier[]
): RunnerRewardTier {
  for (const tier of tiers) {
    if (score >= tier.minScore && score <= tier.maxScore) {
      return tier;
    }
  }
  return tiers[0];
}

export function getNextThreshold(
  score: number,
  tiers: RunnerRewardTier[]
): { points: number; tierKey: string } | null {
  for (const tier of tiers) {
    if (score < tier.minScore && tier.minScore > 0) {
      return { points: tier.minScore, tierKey: tier.tierKey ?? '' };
    }
  }
  return null;
}
