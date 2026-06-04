import type { ShopLandingConfig } from '../types/ShopLandingConfig';
import type { ShopConfig } from '../types/ShopConfig';
import { shopConfigToLandingConfig } from './shopConfigToLanding';
import { applyShopConfigLanguage } from './shopConfigLocale';
import {
  fetchShopCatalog,
  findEnabledShopByUrlSlug,
  findShopByUrlSlug,
  isShopAccessible,
  isShopEnabled,
  isShopExpired,
} from './shopCatalog';

/** Saved from /setup/campaign/form — opens at /shop/campaign-preview */
export const CAMPAIGN_PREVIEW_SLUG = 'campaign-preview';
export const CAMPAIGN_LANDING_STORAGE_KEY = 'twirla_campaign_landing_v1';

/** Template shop slug for merging browser drafts (must exist in shop catalog). */
export const CAMPAIGN_PREVIEW_TEMPLATE_SLUG = 'demo-shop';

export function mergeLandingDraft(
  base: ShopLandingConfig,
  draft: Partial<ShopLandingConfig>
): ShopLandingConfig {
  return {
    ...base,
    ...draft,
    shopSlug: draft.shopSlug ?? base.shopSlug,
    hero: {
      ...base.hero,
      ...draft.hero,
      cta: draft.hero?.cta ? { ...base.hero.cta, ...draft.hero.cta } : base.hero.cta,
    },
    social: { ...base.social, ...draft.social },
    footer: draft.footer ? { ...base.footer, ...draft.footer } : base.footer,
    experiencePath: draft.experiencePath ?? base.experiencePath,
    featuredProducts: draft.featuredProducts ?? base.featuredProducts,
    enabledGames: draft.enabledGames ?? base.enabledGames,
    testimonials: draft.testimonials ?? base.testimonials,
    trustBadges: draft.trustBadges ?? base.trustBadges,
    faq: draft.faq ?? base.faq,
    valueProposition: draft.valueProposition ?? base.valueProposition,
    howToOrder: draft.howToOrder ?? base.howToOrder,
    about: draft.about ? { ...(base.about ?? {}), ...draft.about } : base.about,
    particlesBackground: draft.particlesBackground ?? base.particlesBackground,
    spotPalette: draft.spotPalette ?? base.spotPalette,
  };
}

/**
 * Resolve landing config from the shop catalog API (no hardcoded shop objects).
 * `campaign-preview` merges optional localStorage draft over the template shop from JSON.
 * Pass the active UI `language` so `applyShopConfigLanguage` merges Albanian fallbacks and `campaign.translations`.
 */
export async function getShopLandingConfig(
  shopSlug: string,
  language: 'en' | 'sq' = 'en'
): Promise<ShopLandingConfig> {
  const shops = await fetchShopCatalog();

  if (shopSlug === CAMPAIGN_PREVIEW_SLUG) {
    const template =
      findEnabledShopByUrlSlug(CAMPAIGN_PREVIEW_TEMPLATE_SLUG, shops) ??
      findEnabledShopByUrlSlug('demo', shops) ??
      shops.find(isShopAccessible);
    if (!template) {
      throw new Error('Shop catalog has no accessible shops');
    }
    const localized = applyShopConfigLanguage(template as ShopConfig, language);
    const base = shopConfigToLandingConfig(localized, CAMPAIGN_PREVIEW_SLUG);
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CAMPAIGN_LANDING_STORAGE_KEY);
      if (raw) {
        try {
          const draft = JSON.parse(raw) as Partial<ShopLandingConfig>;
          return mergeLandingDraft(base, {
            ...draft,
            shopSlug: CAMPAIGN_PREVIEW_SLUG,
            experiencePath: draft.experiencePath ?? base.experiencePath,
          });
        } catch {
          /* ignore */
        }
      }
    }
    return base;
  }

  const shop = findEnabledShopByUrlSlug(shopSlug, shops);
  if (!shop) {
    const exists = findShopByUrlSlug(shopSlug, shops);
    if (exists && !isShopEnabled(exists)) {
      throw new Error('SHOP_DISABLED');
    }
    if (exists && isShopExpired(exists)) {
      throw new Error('SHOP_EXPIRED');
    }
    throw new Error(`Unknown shop slug: ${shopSlug}`);
  }
  const localized = applyShopConfigLanguage(shop as ShopConfig, language);
  return shopConfigToLandingConfig(localized, shopSlug);
}
