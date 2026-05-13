/**
 * Optional four-color "spot" palette for a shop (landing + games).
 * When set, theme tokens and `--shop-palette-*` CSS variables align to these roles.
 */
export interface ShopSpotPalette {
  /** Deepest brand tone (page base, ground, dark chrome) */
  deep: string;
  /** Mid slate / secondary surfaces and borders */
  muted: string;
  /** Pale wash (high-contrast body/headings on dark UI) */
  wash: string;
  /** Accent pop (CTAs, game highlights, gold, etc.) */
  accent: string;
}
