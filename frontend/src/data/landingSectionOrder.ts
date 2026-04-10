import type { LandingLayoutTemplate } from '../types/ShopLandingConfig';

/** Section keys rendered inside `<main>` (hero is always first, outside this order). */
export type LandingMainSectionKey =
  | 'value'
  | 'products'
  | 'howItWorks'
  | 'games'
  | 'howToOrder'
  | 'about'
  | 'contact'
  | 'testimonials'
  | 'trust'
  | 'faq';

export const LANDING_MAIN_SECTION_ORDER: Record<
  LandingLayoutTemplate,
  readonly LandingMainSectionKey[]
> = {
  'product-focused': [
    'value',
    'products',
    'howItWorks',
    'games',
    'howToOrder',
    'about',
    'contact',
    'testimonials',
    'trust',
    'faq',
  ],
  'story-driven': [
    'value',
    'about',
    'products',
    'howItWorks',
    'games',
    'howToOrder',
    'contact',
    'testimonials',
    'trust',
    'faq',
  ],
  'game-first': [
    'games',
    'value',
    'products',
    'howItWorks',
    'howToOrder',
    'about',
    'contact',
    'testimonials',
    'trust',
    'faq',
  ],
};
