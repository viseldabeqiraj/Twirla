import type {
  AboutConfig,
  FAQItemConfig,
  FeaturedProductConfig,
  HowToOrderConfig,
  LandingFontPairId,
  LandingLayoutTemplate,
  ParticlesBackgroundConfig,
  SocialLinksConfig,
  TestimonialConfig,
  TrustBadgeConfig,
  ValuePropositionConfig,
} from './ShopLandingConfig';
import type { ShopSpotPalette } from './ShopSpotPalette';

/** Mirrors ExperienceMode strings from shop config (avoids circular import with ShopConfig). */
export type CampaignExperienceMode =
  | 'Runner'
  | 'Wheel'
  | 'TapHearts'
  | 'Scratch'
  | 'Countdown'
  | 'MemoryMatch';

export interface CampaignHeroConfig {
  headline?: string;
  tagline?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundStyle?: 'gradient' | 'solid';
  backgroundImageUrl?: string;
  backgroundImageOverlay?: 'dark' | 'medium' | 'light';
  backgroundPattern?: 'none' | 'dots' | 'mesh' | 'grain';
}

export interface ShopCampaignPageConfig {
  layoutTemplate?: LandingLayoutTemplate;
  fontPairId?: LandingFontPairId;
  accentColor?: string;
  featuredSectionTitle?: string;
  gamesSectionTitle?: string;
  featuredGame?: CampaignExperienceMode;
  enabledGameModes?: CampaignExperienceMode[];
  experiencesSlug?: string;
  experiencesUniqueId?: string;
  hero?: CampaignHeroConfig;
  valueProposition?: ValuePropositionConfig;
  howToOrder?: HowToOrderConfig;
  about?: AboutConfig;
  social?: SocialLinksConfig;
  featuredProducts?: FeaturedProductConfig[];
  testimonials?: TestimonialConfig[];
  trustBadges?: TrustBadgeConfig[];
  faq?: FAQItemConfig[];
  /** Optional linked-particles layer on `/shop/:slug` (see ParticlesBackgroundConfig). */
  particlesBackground?: ParticlesBackgroundConfig;
  /** Optional four-color palette (overrides `branding.spotPalette` when set). */
  spotPalette?: ShopSpotPalette;
  /**
   * Localized campaign overlays keyed by locale (`sq`, future locales).
   * Deep-merged in `applyShopConfigLanguage` when `getShopLandingConfig(..., lang)` matches.
   * Example: `"translations": { "sq": { "hero": { "headline": "..." }, "about": { "physicalAddress": "..." } } }`
   */
  translations?: Record<string, Partial<ShopCampaignPageConfig>>;
}
