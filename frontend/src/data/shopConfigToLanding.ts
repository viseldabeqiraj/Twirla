import type { ShopConfig } from '../types/ShopConfig';
import type { ShopLandingConfig } from '../types/ShopLandingConfig';
import { PUBLIC_CAMPAIGN_GAMES } from '../types/ShopLandingConfig';
import { ExperienceMode } from '../types/ShopConfig';
import type { CampaignExperienceMode } from '../types/ShopCampaign';

function parseCampaignMode(m?: CampaignExperienceMode): ExperienceMode | undefined {
  if (!m) return undefined;
  return ExperienceMode[m as keyof typeof ExperienceMode];
}

/**
 * Map a shop row from shops.json + URL slug to ShopLandingConfig.
 * Landing copy and layout come from `shop.campaign` when present; otherwise sensible defaults from branding/text.
 */
export function shopConfigToLandingConfig(config: ShopConfig, shopSlug: string): ShopLandingConfig {
  const campaign = config.campaign;
  const { branding, text, cta } = config;
  const shopName = branding.brandName ?? config.name ?? formatSlugAsName(shopSlug);
  const ch = campaign?.hero;

  const allFromConfig: ExperienceMode[] = [];
  if (config.wheel) allFromConfig.push(ExperienceMode.Wheel);
  if (config.tapHearts) allFromConfig.push(ExperienceMode.TapHearts);
  if (config.scratch) allFromConfig.push(ExperienceMode.Scratch);
  if (config.countdown) allFromConfig.push(ExperienceMode.Countdown);
  if (config.memory) allFromConfig.push(ExperienceMode.MemoryMatch);
  allFromConfig.unshift(ExperienceMode.Runner);

  let enabledGames = allFromConfig.filter((m) => PUBLIC_CAMPAIGN_GAMES.includes(m));
  if (campaign?.enabledGameModes?.length) {
    const allowed = new Set(
      campaign.enabledGameModes
        .map((x) => parseCampaignMode(x))
        .filter((x): x is ExperienceMode => x !== undefined)
    );
    enabledGames = enabledGames.filter((m) => allowed.has(m));
  }

  const fg = parseCampaignMode(campaign?.featuredGame);
  const featuredGame =
    fg && enabledGames.includes(fg) ? fg : enabledGames[0];

  const expSlug = (campaign?.experiencesSlug ?? config.slug ?? shopSlug).trim();
  const expId = campaign?.experiencesUniqueId?.trim() || 'main';

  return {
    shopSlug,
    experiencePath: { shopName: expSlug, uniqueId: expId },
    layoutTemplate: campaign?.layoutTemplate,
    fontPairId: campaign?.fontPairId,
    accentColor: campaign?.accentColor ?? branding.accentColor,
    valueProposition: campaign?.valueProposition,
    howToOrder: campaign?.howToOrder,
    about: campaign?.about,
    social: { ...(campaign?.social ?? {}) },
    featuredProducts: campaign?.featuredProducts ?? [],
    testimonials: campaign?.testimonials,
    trustBadges: campaign?.trustBadges,
    faq: campaign?.faq,
    featuredSectionTitle: campaign?.featuredSectionTitle,
    gamesSectionTitle: campaign?.gamesSectionTitle,
    hero: {
      logoUrl: branding.logoUrl,
      shopName,
      headline: ch?.headline,
      tagline: ch?.tagline ?? text.subtitle ?? '',
      cta: {
        label: ch?.ctaLabel ?? text.ctaText,
        url: ch?.ctaUrl ?? cta.url,
      },
      backgroundStyle: ch?.backgroundStyle ?? 'gradient',
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      backgroundImageUrl: ch?.backgroundImageUrl,
      backgroundImageOverlay: ch?.backgroundImageOverlay,
      backgroundPattern: ch?.backgroundPattern,
    },
    enabledGames,
    featuredGame,
    footer: {
      shopName,
      copyright: `© ${shopName}`,
      contactLine: text.ctaText,
    },
    primaryColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    backgroundMode: branding.backgroundMode ?? (branding.theme?.backgroundPattern === 'dark' ? 'dark' : 'light'),
    logoBackgroundColor: branding.logoBackgroundColor,
  };
}

function formatSlugAsName(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');
}
