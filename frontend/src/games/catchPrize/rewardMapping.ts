import type { TapHeartsOutcome } from '../../types/ShopConfig';
import { pickWeighted } from '../pickWeighted';

/** Built-in outcomes when `tapHearts.outcomes` is omitted from shops.json. */
export const DEFAULT_CATCH_PRIZE_OUTCOMES: TapHeartsOutcome[] = [
  {
    headline: 'You won: 5% off',
    description: 'Message the shop to get your code.',
    weight: 36,
  },
  {
    headline: 'You won: 10% off',
    description: 'Use at checkout (the shop will confirm).',
    weight: 30,
  },
  {
    headline: 'You won: a gift card perk',
    description: 'DM the shop with a screenshot of this screen.',
    weight: 24,
  },
  {
    headline: 'You won: 15% off',
    description: 'Screenshot this screen and message the shop.',
    weight: 10,
  },
];

export function pickCatchPrizeOutcome(shopOutcomes?: TapHeartsOutcome[]): TapHeartsOutcome {
  const list =
    shopOutcomes && shopOutcomes.length > 0 ? shopOutcomes : DEFAULT_CATCH_PRIZE_OUTCOMES;
  return pickWeighted(list);
}
