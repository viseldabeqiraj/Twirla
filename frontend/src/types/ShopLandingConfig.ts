import { ExperienceMode } from './ShopConfig';

/** Only these games are shown on the public campaign landing (no Countdown). */
export const PUBLIC_CAMPAIGN_GAMES: ExperienceMode[] = [
  ExperienceMode.Runner,
  ExperienceMode.Wheel,
  ExperienceMode.Scratch,
  ExperienceMode.TapHearts,
];

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
}

export interface AboutConfig {
  whatWeSell?: string;
  aboutUs?: string;
  contact?: string;
  city?: string;
  country?: string;
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
