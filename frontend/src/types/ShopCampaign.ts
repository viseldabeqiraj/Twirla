import type {
  AboutConfig,
  FAQItemConfig,
  FeaturedProductConfig,
  HowToOrderConfig,
  LandingFontPairId,
  LandingLayoutTemplate,
  SocialLinksConfig,
  TestimonialConfig,
  TrustBadgeConfig,
  ValuePropositionConfig,
} from './ShopLandingConfig';

/** Mirrors ExperienceMode strings from shops.json (avoids circular import with ShopConfig). */
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
}
