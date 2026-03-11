import { ExperienceMode } from './ShopConfig';

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
  enabledGames: ExperienceMode[];
  footer: FooterConfig;
  /** Optional: primary color for gradient/theme (overrides hero.primaryColor if set at root) */
  primaryColor?: string;
  secondaryColor?: string;
}

export interface HeroConfig {
  logoUrl?: string;
  shopName: string;
  tagline: string;
  /** Primary CTA button */
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
