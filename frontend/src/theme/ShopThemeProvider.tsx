import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
  getShopTheme,
  themeTokensToCssVars,
  type ShopThemeInput,
  type ShopThemeTokens,
} from './shopTheme';

const ShopThemeContext = createContext<ShopThemeTokens | null>(null);

export function useShopTheme(): ShopThemeTokens | null {
  return useContext(ShopThemeContext);
}

/**
 * Compute theme tokens + CSS variable map from raw color input.
 * Use this in components that already own the root element
 * (spread cssVars into the element's `style` prop).
 */
export function useComputedShopTheme(input: ShopThemeInput) {
  const tokens = useMemo(
    () => getShopTheme(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.primaryColor, input.secondaryColor, input.accentColor, input.backgroundMode],
  );
  const cssVars = useMemo(() => themeTokensToCssVars(tokens), [tokens]);
  return { tokens, cssVars };
}

interface ShopThemeProviderProps {
  input: ShopThemeInput;
  children: ReactNode;
}

/**
 * Wrap a subtree so any descendant can call `useShopTheme()`.
 * Does NOT inject CSS variables — the consumer that owns the root
 * element should spread `cssVars` from `useComputedShopTheme`.
 */
export function ShopThemeProvider({ input, children }: ShopThemeProviderProps) {
  const { tokens } = useComputedShopTheme(input);
  return (
    <ShopThemeContext.Provider value={tokens}>
      {children}
    </ShopThemeContext.Provider>
  );
}
