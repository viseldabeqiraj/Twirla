import { createContext, useContext, type ReactNode } from 'react';

export interface ShopExperienceContextValue {
  /** Days the customer has to redeem a generated coupon (shop-specific). */
  couponValidDays: number;
  /**
   * False after a round ends in this session — hides play-again only.
   * Does not replace the win/loss screen.
   */
  canReplay: boolean;
  /** Call when a game round ends (persists to localStorage, disables replay). */
  markPlayed: () => void;
}

const ShopExperienceContext = createContext<ShopExperienceContextValue>({
  couponValidDays: 7,
  canReplay: true,
  markPlayed: () => {},
});

export function ShopExperienceProvider({
  value,
  children,
}: {
  value: ShopExperienceContextValue;
  children: ReactNode;
}) {
  return (
    <ShopExperienceContext.Provider value={value}>{children}</ShopExperienceContext.Provider>
  );
}

export function useShopExperience(): ShopExperienceContextValue {
  return useContext(ShopExperienceContext);
}
