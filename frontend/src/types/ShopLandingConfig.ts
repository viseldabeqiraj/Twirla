import { ExperienceMode } from './ShopConfig';

/** Games that can appear on the public campaign landing when enabled for the shop. */
export const PUBLIC_CAMPAIGN_GAMES: ExperienceMode[] = [
  ExperienceMode.Runner,
  ExperienceMode.Wheel,
  ExperienceMode.Scratch,
  ExperienceMode.TapHearts,
  ExperienceMode.MemoryMatch,
  //ExperienceMode.Countdown,
];

/** Landing section order presets (Twirla admin: drag-and-drop will map to this). */
export type LandingLayoutTemplate = 'product-focused' | 'story-driven' | 'game-first';

/** Curated headline/body font pairs (admin guardrail: pick from this list only). */
export type LandingFontPairId = 'default' | 'editorial' | 'modern-tech';

/** Slug used in URL: /shop/:shopSlug */
export interface ShopLandingConfig {
  shopSlug: string;
  /** Used to build game links: /:mode/:shopName/:uniqueId */
  experiencePath: {
    shopName: string;
    uniqueId: string;
  };
  hero: HeroConfig;
  about?: AboutConfig;
  social: SocialLinksConfig;
  featuredProducts: FeaturedProductConfig[];
  /** Games enabled for this shop (filtered to PUBLIC_CAMPAIGN_GAMES on public page) */
  enabledGames: ExperienceMode[];
  /** Primary game shown above the fold; defaults to first enabled if not set */
  featuredGame?: ExperienceMode;
  footer: FooterConfig;
  /** Optional: primary color for gradient/theme (overrides hero.primaryColor if set at root) */
  primaryColor?: string;
  secondaryColor?: string;
  /** Optional: section title overrides for landing (e.g. "Featured", "Play games") */
  featuredSectionTitle?: string;
  gamesSectionTitle?: string;
  /** Optional: customer testimonials / social proof (section hidden if empty) */
  testimonials?: TestimonialConfig[];
  /** Optional: trust badges or benefits (e.g. "Free shipping", "Secure") (section hidden if empty) */
  trustBadges?: TrustBadgeConfig[];
  /** Optional: FAQ items (section hidden if empty) */
  faq?: FAQItemConfig[];
  /** Shop USP: headline + short body (trust & differentiation) */
  valueProposition?: ValuePropositionConfig;
  /** How customers can order (DM, WhatsApp, external store) */
  howToOrder?: HowToOrderConfig;
  /** Third brand color (buttons, accents); falls back to primary if omitted */
  accentColor?: string;
  /** Page background mode: "light" (default) or "dark" */
  backgroundMode?: 'light' | 'dark';
  /** Explicit logo container color */
  logoBackgroundColor?: string;
  /** Section order template */
  layoutTemplate?: LandingLayoutTemplate;
  /** Typography pair (loaded via index.html Google Fonts subset) */
  fontPairId?: LandingFontPairId;
}

export interface TestimonialConfig {
  quote: string;
  author: string;
  role?: string;
}

export interface TrustBadgeConfig {
  label: string;
  icon?: string;
}

export interface FAQItemConfig {
  question: string;
  answer: string;
}

export interface HeroConfig {
  logoUrl?: string;
  shopName: string;
  /** Campaign headline above the fold (e.g. "Play and win a surprise discount") */
  headline?: string;
  /** Short reward promise / tagline */
  tagline: string;
  /** Primary CTA button (e.g. "Play now" / "Start game") */
  cta: {
    label: string;
    url: string;
  };
  /** Optional gradient or solid background */
  backgroundStyle?: 'gradient' | 'solid';
  primaryColor?: string;
  secondaryColor?: string;
  /** Full-bleed hero photo (absolute URL or /logos/…); paired with backgroundImageOverlay */
  backgroundImageUrl?: string;
  /** Readability over backgroundImageUrl */
  backgroundImageOverlay?: 'dark' | 'medium' | 'light';
  /** Subtle pattern on hero card (skipped when backgroundImageUrl is set) */
  backgroundPattern?: 'none' | 'dots' | 'mesh' | 'grain';
}

export interface ValuePropositionConfig {
  headline?: string;
  body?: string;
}

export interface HowToOrderConfig {
  /** Defaults to i18n if omitted */
  heading?: string;
  body?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
}

export interface AboutConfig {
  whatWeSell?: string;
  aboutUs?: string;
  contact?: string;
  city?: string;
  country?: string;
  /** Street or full address for pickup / trust */
  physicalAddress?: string;
  /** Owner or workspace photo (URL) */
  ownerPhotoUrl?: string;
}

export interface SocialLinksConfig {
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  website?: string;
  phone?: string;
  email?: string;
}

export interface FeaturedProductConfig {
  id: string;
  imageUrl?: string;
  title: string;
  description?: string;
  price?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface FooterConfig {
  shopName: string;
  copyright?: string;
  contactLine?: string;
}
