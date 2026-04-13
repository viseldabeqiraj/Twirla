/**
 * Runner game types and shop-configurable random outcomes for Twirla.
 */

import type { RunnerGameOutcome } from '../../types/ShopConfig';

export type { RunnerGameOutcome };

/** Default outcomes when `runnerGame.outcomes` is omitted from shops.json. */
export const DEFAULT_RUNNER_OUTCOMES: RunnerGameOutcome[] = [
  {
    headline: 'You won: 5% off',
    body: 'Message the shop to get your code.',
    weight: 38,
  },
  {
    headline: 'You won: 10% off',
    body: 'Use at checkout (the shop will confirm).',
    weight: 32,
  },
  {
    headline: 'You won: a small perk',
    body: 'DM the shop with a screenshot of this screen.',
    weight: 22,
  },
  {
    headline: 'You won: 15% off',
    body: 'Screenshot this screen and message the shop.',
    weight: 8,
  },
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
  /** Weighted random rows when the run ends (from `runnerGame.outcomes` in shops.json). */
  outcomes?: RunnerGameOutcome[];
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
