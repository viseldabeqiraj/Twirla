import type { ShopConfig } from '../types/ShopConfig';
import type { ShopLandingConfig } from '../types/ShopLandingConfig';
import { ExperienceMode } from '../types/ShopConfig';

/**
 * Map API ShopConfig + URL slug to ShopLandingConfig so the landing page
 * uses real shop branding (logo, colors, name, CTA) and enabled games.
 */
export function shopConfigToLandingConfig(config: ShopConfig, shopSlug: string): ShopLandingConfig {
  const { branding, text, cta } = config;
  const shopName = branding.brandName ?? (config as { name?: string }).name ?? formatSlugAsName(shopSlug);

  const enabledGames: ExperienceMode[] = [];
  if (config.wheel) enabledGames.push(ExperienceMode.Wheel);
  if (config.tapHearts) enabledGames.push(ExperienceMode.TapHearts);
  if (config.scratch) enabledGames.push(ExperienceMode.Scratch);
  if (config.countdown) enabledGames.push(ExperienceMode.Countdown);
  // Runner is always available as an experience mode
  enabledGames.unshift(ExperienceMode.Runner);

  return {
    shopSlug,
    experiencePath: {
      shopName: shopSlug,
      uniqueId: 'main',
    },
    hero: {
      logoUrl: branding.logoUrl,
      shopName,
      tagline: text.subtitle ?? 'Play, win rewards, and shop with us.',
      cta: {
        label: text.ctaText,
        url: cta.url,
      },
      backgroundStyle: 'gradient',
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
    },
    social: {},
    featuredProducts: [],
    enabledGames,
    footer: {
      shopName,
      copyright: `© ${shopName}`,
      contactLine: text.ctaText,
    },
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
  };
}

function formatSlugAsName(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');
}
