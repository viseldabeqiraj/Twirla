import type { ShopConfig } from '../types/ShopConfig';

export function randomToken(length = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export function generateShopId(displayName: string): string {
  const clean = displayName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
  const suffix = randomToken(12);
  return `${clean || 'shop'}-${suffix}`;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function buildShopConfigFromForm(input: {
  name: string;
  slug: string;
  shopId: string;
  adminToken: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  ctaUrl: string;
  title: string;
  subtitle: string;
  experienceSlug: string;
  experienceUniqueId: string;
  enableWheel: boolean;
  enableTapHearts: boolean;
  enableScratch: boolean;
  enableCountdown: boolean;
  enableMemory: boolean;
  enableRunner: boolean;
  advancedJson?: string;
}): ShopConfig {
  if (input.advancedJson?.trim()) {
    const parsed = JSON.parse(input.advancedJson) as ShopConfig;
    if (!parsed.shopId) parsed.shopId = input.shopId;
    if (!parsed.slug) parsed.slug = input.slug;
    if (!parsed.adminToken) parsed.adminToken = input.adminToken;
    return parsed;
  }

  const config: ShopConfig = {
    shopId: input.shopId,
    slug: input.slug,
    name: input.name.trim() || undefined,
    adminToken: input.adminToken,
    enabled: true,
    playCooldownHours: 24,
    branding: {
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      brandName: input.name.trim() || input.slug,
      logoUrl: input.logoUrl.trim() || undefined,
    },
    text: {
      title: input.title.trim() || 'Play to win!',
      subtitle: input.subtitle.trim() || 'Try your luck',
      ctaText: 'DM us to claim',
      resultTitle: 'You won!',
      resultSubtitle: 'Thanks for playing',
    },
    cta: { url: input.ctaUrl.trim() || 'https://instagram.com/' },
    campaign: {
      experiencesSlug: input.experienceSlug.trim() || input.slug,
      experiencesUniqueId: input.experienceUniqueId.trim() || input.shopId.split('-').pop() || 'main',
      hero: {
        headline: input.title.trim() || undefined,
        tagline: input.subtitle.trim() || undefined,
      },
    },
  };

  if (input.enableWheel) {
    config.wheel = {
      allowRepeatSpins: false,
      prizes: [
        { label: '10% Off', weight: 50, description: 'On your next order' },
        { label: 'Try Again', weight: 50, isWinning: false, description: 'Come back later' },
      ],
    };
  }
  if (input.enableTapHearts) {
    config.tapHearts = {
      heartsToTap: 10,
      heartColor: input.primaryColor,
      revealText: 'You won!',
      outcomes: [{ headline: '10% off', weight: 70 }, { headline: 'Try again', weight: 30, isNoWin: true }],
    };
  }
  if (input.enableScratch) {
    config.scratch = {
      overlayColor: input.primaryColor,
      overlayText: 'Scratch here',
      revealText: 'You won!',
      revealSubtitle: 'DM us to claim',
    };
  }
  if (input.enableCountdown) {
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    config.countdown = {
      endAt: end,
      endMessage: 'Time is up — thanks for playing!',
      showCtaBeforeEnd: true,
    };
  }
  if (input.enableMemory) {
    config.memory = {
      pairCount: 6,
      revealText: 'You matched them all!',
      revealSubtitle: 'Claim your prize',
    };
  }
  if (input.enableRunner) {
    config.runnerGame = {
      outcomes: [{ headline: 'Finish bonus', weight: 80 }, { headline: 'Better luck next time', weight: 20, isNoWin: true }],
    };
  }

  return config;
}
