/**
 * Map final score to reward tier for Catch the Prize.
 */

export type RewardTierKey = 'no_reward' | 'small' | 'medium' | 'top';

export interface RewardTier {
  key: RewardTierKey;
  minScore: number;
  maxScore: number;
  messageKey: string;
}

export const REWARD_TIERS: RewardTier[] = [
  { key: 'no_reward', minScore: -Infinity, maxScore: 7, messageKey: 'catchPrize.reward.noReward' },
  { key: 'small', minScore: 8, maxScore: 14, messageKey: 'catchPrize.reward.small' },
  { key: 'medium', minScore: 15, maxScore: 24, messageKey: 'catchPrize.reward.medium' },
  { key: 'top', minScore: 25, maxScore: Infinity, messageKey: 'catchPrize.reward.top' },
];

export function getRewardTier(score: number): RewardTier {
  for (let i = REWARD_TIERS.length - 1; i >= 0; i--) {
    if (score >= REWARD_TIERS[i].minScore && score <= REWARD_TIERS[i].maxScore) {
      return REWARD_TIERS[i];
    }
  }
  return REWARD_TIERS[0];
}
