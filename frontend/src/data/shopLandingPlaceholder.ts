import { ShopLandingConfig } from '../types/ShopLandingConfig';
import { ExperienceMode } from '../types/ShopConfig';

/**
 * Placeholder landing config for MVP.
 * Later: replace with API fetch by shopSlug (e.g. /api/shop/:shopSlug/landing).
 */
export const PLACEHOLDER_SHOP_LANDING: ShopLandingConfig = {
  shopSlug: 'demo-shop',
  experiencePath: {
    shopName: 'demo-shop',
    uniqueId: 'main',
  },
  hero: {
    shopName: 'Demo Shop',
    tagline: 'Handmade & unique. Your style, delivered.',
    cta: {
      label: 'Visit our store',
      url: 'https://example.com',
    },
    backgroundStyle: 'gradient',
    primaryColor: '#db2777',
    secondaryColor: '#be185d',
  },
  about: {
    whatWeSell: 'Handmade accessories, custom prints, and lifestyle goods.',
    aboutUs: 'We started small and believe in quality over quantity. Every item is made with care.',
    city: 'Tirana',
    country: 'Albania',
  },
  social: {
    instagram: 'https://instagram.com/demoshop',
    tiktok: 'https://tiktok.com/@demoshop',
    whatsapp: 'https://wa.me/355123456789',
    website: 'https://example.com',
  },
  featuredProducts: [
    {
      id: '1',
      title: 'Custom Tote Bag',
      description: 'Eco-friendly, durable, perfect for daily use.',
      price: '€24',
      ctaLabel: 'DM to order',
      ctaUrl: 'https://instagram.com/demoshop',
    },
    {
      id: '2',
      title: 'Limited Print',
      description: 'Exclusive design, limited run.',
      price: '€18',
      ctaLabel: 'DM to order',
      ctaUrl: 'https://instagram.com/demoshop',
    },
    {
      id: '3',
      title: 'Gift Set',
      description: 'Ideal for gifting. Includes 3 bestsellers.',
      price: '€45',
      ctaLabel: 'DM to order',
      ctaUrl: 'https://instagram.com/demoshop',
    },
  ],
  enabledGames: [
    ExperienceMode.Runner,
    ExperienceMode.Wheel,
    ExperienceMode.Scratch,
    ExperienceMode.TapHearts,
    ExperienceMode.Countdown,
  ],
  footer: {
    shopName: 'Demo Shop',
    copyright: '© Demo Shop',
    contactLine: 'DM us anytime',
  },
  primaryColor: '#db2777',
  secondaryColor: '#be185d',
};

const slugToConfig: Record<string, ShopLandingConfig> = {
  'demo-shop': PLACEHOLDER_SHOP_LANDING,
};

/**
 * Resolve landing config by slug. MVP: returns placeholder for known slug or a copy with that slug.
 * Later: fetch from API.
 */
export function getShopLandingConfig(shopSlug: string): Promise<ShopLandingConfig> {
  const existing = slugToConfig[shopSlug];
  if (existing) {
    return Promise.resolve(existing);
  }
  const base = { ...PLACEHOLDER_SHOP_LANDING };
  const config: ShopLandingConfig = {
    ...base,
    shopSlug,
    experiencePath: {
      shopName: shopSlug,
      uniqueId: 'main',
    },
    hero: { ...base.hero, shopName: shopSlug.replace(/-/g, ' ') },
    footer: { ...base.footer, shopName: shopSlug.replace(/-/g, ' ') },
  };
  return Promise.resolve(config);
}
