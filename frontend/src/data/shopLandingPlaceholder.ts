import { ShopLandingConfig, PUBLIC_CAMPAIGN_GAMES } from '../types/ShopLandingConfig';
import { ExperienceMode } from '../types/ShopConfig';

/**
 * Placeholder landing config for MVP.
 * Only public campaign games (Wheel, Scratch, Runner, Catch the Prize); no Countdown.
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
  enabledGames: [...PUBLIC_CAMPAIGN_GAMES],
  featuredGame: ExperienceMode.Runner,
  footer: {
    shopName: 'Demo Shop',
    copyright: '© Demo Shop',
    contactLine: 'DM us anytime',
  },
  primaryColor: '#db2777',
  secondaryColor: '#be185d',
  featuredSectionTitle: 'Featured',
  gamesSectionTitle: 'Play & Win',
  testimonials: [
    { quote: 'So much fun! Won a discount and the order arrived super fast.', author: 'Ana M.', role: 'Customer' },
    { quote: 'Love the games and the shop. Will definitely come back.', author: 'Ermal K.', role: 'Customer' },
  ],
  trustBadges: [
    { label: 'Fast delivery', icon: '🚚' },
    { label: 'Secure payment', icon: '🔒' },
    { label: 'Easy returns', icon: '↩️' },
  ],
  faq: [
    { question: 'How do I claim my prize?', answer: 'After playing, use the "DM us to claim" button or message the shop with your code. They will confirm and apply your reward.' },
    { question: 'Can I play more than once?', answer: 'You can play one game per day. Come back tomorrow for another chance to win!' },
  ],
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
