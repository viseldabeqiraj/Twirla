/**
 * Runner game types and configurable reward tiers for Twirla.
 * Reward tiers can be customized per shop later.
 */

export interface RunnerRewardTier {
  minScore: number;
  maxScore: number; // use Infinity for "and above"
  message: string;
  /** Optional key for analytics or shop-specific handling */
  tierKey?: string;
}

/** Default reward tiers – configurable per shop (tougher thresholds) */
export const DEFAULT_REWARD_TIERS: RunnerRewardTier[] = [
  { minScore: 0, maxScore: 79, message: 'Try again for a reward', tierKey: 'try_again' },
  { minScore: 80, maxScore: 159, message: 'You unlocked 5% off', tierKey: '5_off' },
  { minScore: 160, maxScore: 279, message: 'You unlocked 10% off', tierKey: '10_off' },
  { minScore: 280, maxScore: Infinity, message: 'You unlocked a surprise reward', tierKey: 'surprise' },
];

export interface RunnerTheme {
  /** Background gradient (e.g. soft beige-pink) */
  background?: string;
  /** Accent color (e.g. pink/magenta) */
  accent?: string;
  /** Lighter highlight */
  highlight?: string;
  /** Ground/surface color */
  ground?: string;
  /** Obstacle color */
  obstacleColor?: string;
}

/** Default Twirla-style palette */
export const DEFAULT_RUNNER_THEME: RunnerTheme = {
  background: 'linear-gradient(180deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
  accent: '#db2777',
  highlight: '#f472b6',
  ground: '#fbcfe8',
  obstacleColor: '#be185d',
};

export interface RunnerGameConfig {
  rewardTiers?: RunnerRewardTier[];
  theme?: RunnerTheme;
  /** CTA label after game over (e.g. "Claim reward" or "DM us") */
  ctaLabel?: string;
  /** CTA URL (optional) */
  ctaUrl?: string;
  /** Game title shown on intro */
  title?: string;
  /** Instruction text */
  instruction?: string;
}

export type RunnerGameState = 'intro' | 'playing' | 'gameover';
