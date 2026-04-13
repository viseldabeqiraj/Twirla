import { createContext } from 'react';

/**
 * When true, {@link RewardModal} omits the primary shop CTA — the experience
 * footer already shows the same link (e.g. WhatsApp / Instagram).
 */
export const HideRewardModalShopCtaContext = createContext(false);
