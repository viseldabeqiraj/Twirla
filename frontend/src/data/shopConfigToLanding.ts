import type { ShopConfig } from '../types/ShopConfig';
import type { ShopLandingConfig } from '../types/ShopLandingConfig';
import { PUBLIC_CAMPAIGN_GAMES } from '../types/ShopLandingConfig';
import { ExperienceMode } from '../types/ShopConfig';

/**
 * Map API ShopConfig + URL slug to ShopLandingConfig so the landing page
 * uses real shop branding (logo, colors, name, CTA) and enabled games.
 * Only public campaign games (Wheel, Scratch, Runner, Catch the Prize) are included.
 */
export function shopConfigToLandingConfig(config: ShopConfig, shopSlug: string): ShopLandingConfig {
  const { branding, text, cta } = config;
  const shopName = branding.brandName ?? (config as { name?: string }).name ?? formatSlugAsName(shopSlug);

  const allEnabled: ExperienceMode[] = [];
  if (config.wheel) allEnabled.push(ExperienceMode.Wheel);
  if (config.tapHearts) allEnabled.push(ExperienceMode.TapHearts);
  if (config.scratch) allEnabled.push(ExperienceMode.Scratch);
  if (config.countdown) allEnabled.push(ExperienceMode.Countdown);
  allEnabled.unshift(ExperienceMode.Runner);
  const enabledGames = allEnabled.filter((m) => PUBLIC_CAMPAIGN_GAMES.includes(m));
  const featuredGame = enabledGames[0];

  return {
    shopSlug,
    experiencePath: {
      shopName: shopSlug,
      uniqueId: 'main',
    },
    hero: {
      logoUrl: branding.logoUrl,
      shopName,
      headline: undefined,
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
    featuredGame,
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
