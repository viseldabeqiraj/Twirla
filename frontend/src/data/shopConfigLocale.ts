import type { ShopCampaignPageConfig } from '../types/ShopCampaign';
import type { ShopSpotPalette } from '../types/ShopSpotPalette';
import type {
  FAQItemConfig,
  FeaturedProductConfig,
  TestimonialConfig,
  TrustBadgeConfig,
} from '../types/ShopLandingConfig';
import type {
  CountdownConfig,
  MemoryMatchConfig,
  PrizeConfig,
  ScratchConfig,
  ShopConfig,
  TapHeartsConfig,
  TextConfig,
  WheelConfig,
} from '../types/ShopConfig';
import { SHOP_SQ_FALLBACKS, type ShopSqCampaignPatch, type ShopSqFallback } from './shopSqFallbacks';

function mergeIndexed<T extends object>(
  base: T[] | undefined,
  overlay: Partial<T>[] | undefined
): T[] | undefined {
  if (!base?.length) return base;
  if (!overlay?.length) return base;
  return base.map((item, i) => (overlay[i] ? ({ ...item, ...overlay[i] } as T) : item));
}

/** Deep-merge campaign overlay onto base (hero, nested blocks, arrays by index). */
export function deepMergeCampaign(
  base: ShopCampaignPageConfig,
  overlay: Partial<ShopCampaignPageConfig> | ShopSqCampaignPatch
): ShopCampaignPageConfig {
  const o = overlay as Record<string, unknown>;
  return {
    ...base,
    ...overlay,
    hero: o.hero ? { ...base.hero, ...(o.hero as object) } : base.hero,
    valueProposition:
      o.valueProposition != null
        ? { ...base.valueProposition, ...(o.valueProposition as object) }
        : base.valueProposition,
    howToOrder:
      o.howToOrder != null ? { ...base.howToOrder, ...(o.howToOrder as object) } : base.howToOrder,
    about: o.about != null ? { ...base.about, ...(o.about as object) } : base.about,
    social: o.social ? { ...base.social, ...(o.social as object) } : base.social,
    featuredProducts: mergeIndexed<FeaturedProductConfig>(base.featuredProducts, overlay.featuredProducts),
    testimonials: mergeIndexed<TestimonialConfig>(base.testimonials, overlay.testimonials),
    trustBadges: mergeIndexed<TrustBadgeConfig>(base.trustBadges, overlay.trustBadges),
    faq: mergeIndexed<FAQItemConfig>(base.faq, overlay.faq),
    particlesBackground:
      o.particlesBackground != null
        ? { ...(base.particlesBackground ?? {}), ...(o.particlesBackground as object) }
        : base.particlesBackground,
    spotPalette:
      o.spotPalette != null && typeof o.spotPalette === 'object'
        ? { ...(base.spotPalette ?? ({} as ShopSpotPalette)), ...(o.spotPalette as ShopSpotPalette) }
        : base.spotPalette,
  };
}

function omitCampaignTranslations(c: ShopCampaignPageConfig): ShopCampaignPageConfig {
  const { translations: _, ...rest } = c as ShopCampaignPageConfig & {
    translations?: unknown;
  };
  return rest;
}

function mergeText(text: TextConfig, lang: string, fb?: Partial<TextConfig>): TextConfig {
  const tr = text.translations?.[lang];
  if (tr && lang !== 'en') {
    return {
      ...text,
      title: tr.title || text.title,
      subtitle: tr.subtitle ?? text.subtitle,
      ctaText: tr.ctaText || text.ctaText,
      resultTitle: tr.resultTitle || text.resultTitle,
      resultSubtitle: tr.resultSubtitle ?? text.resultSubtitle,
    };
  }
  if (lang === 'sq' && fb) {
    return { ...text, ...fb };
  }
  return text;
}

function mergeWheel(wheel: WheelConfig, lang: string, fbPrizes?: Partial<PrizeConfig>[]): WheelConfig {
  const prizes = wheel.prizes.map((p, i) => {
    const ptr = p.translations?.[lang];
    if (ptr && lang !== 'en') {
      return {
        ...p,
        label: ptr.label || p.label,
        description: ptr.description ?? p.description,
      };
    }
    const fp = fbPrizes?.[i];
    if (lang === 'sq' && fp) {
      return { ...p, ...fp };
    }
    return p;
  });
  return { ...wheel, prizes };
}

function mergeTapHearts(
  th: TapHeartsConfig,
  lang: string,
  fb?: Partial<TapHeartsConfig>
): TapHeartsConfig {
  const tr = th.translations?.[lang];
  if (tr && lang !== 'en') {
    return {
      ...th,
      revealText: tr.revealText || th.revealText,
      revealSubtitle: tr.revealSubtitle ?? th.revealSubtitle,
    };
  }
  if (lang === 'sq' && fb) {
    return { ...th, ...fb };
  }
  return th;
}

function mergeScratch(sc: ScratchConfig, lang: string, fb?: Partial<ScratchConfig>): ScratchConfig {
  const tr = sc.translations?.[lang];
  if (tr && lang !== 'en') {
    return {
      ...sc,
      overlayText: tr.overlayText || sc.overlayText,
      revealText: tr.revealText || sc.revealText,
      revealSubtitle: tr.revealSubtitle ?? sc.revealSubtitle,
    };
  }
  if (lang === 'sq' && fb) {
    return { ...sc, ...fb };
  }
  return sc;
}

function mergeCountdown(cd: CountdownConfig, lang: string, fb?: Partial<CountdownConfig>): CountdownConfig {
  const tr = cd.translations?.[lang];
  if (tr && lang !== 'en') {
    return {
      ...cd,
      endMessage: tr.endMessage || cd.endMessage,
    };
  }
  if (lang === 'sq' && fb?.endMessage) {
    return { ...cd, ...fb };
  }
  return cd;
}

function mergeMemory(mem: MemoryMatchConfig, lang: string, fb?: Partial<MemoryMatchConfig>): MemoryMatchConfig {
  const tr = mem.translations?.[lang];
  if (tr && lang !== 'en') {
    return {
      ...mem,
      revealText: tr.revealText || mem.revealText,
      revealSubtitle: tr.revealSubtitle ?? mem.revealSubtitle,
    };
  }
  if (lang === 'sq' && fb) {
    return { ...mem, ...fb };
  }
  return mem;
}

function mergeCampaignForLanguage(
  campaign: ShopCampaignPageConfig | undefined,
  lang: string,
  fb?: ShopSqCampaignPatch
): ShopCampaignPageConfig | undefined {
  if (!campaign) return undefined;
  const ext = campaign as ShopCampaignPageConfig & {
    translations?: Record<string, Partial<ShopCampaignPageConfig>>;
  };
  const jsonTr = lang !== 'en' ? ext.translations?.[lang] : undefined;
  let c = campaign;
  if (jsonTr && typeof jsonTr === 'object') {
    c = deepMergeCampaign(c, jsonTr);
  }
  if (lang === 'sq' && fb) {
    c = deepMergeCampaign(c, fb);
  }
  return omitCampaignTranslations(c);
}

/**
 * Applies `translations` blocks from shops.json plus Albanian fallbacks from `shopSqFallbacks.ts`.
 * Use when serving static JSON or building landing config so SQ locale does not show English shop copy.
 */
export function applyShopConfigLanguage(config: ShopConfig, lang: string): ShopConfig {
  if (!lang || lang === 'en') return config;
  const slug = config.slug ?? '';
  const fb: ShopSqFallback | undefined = SHOP_SQ_FALLBACKS[slug];

  const text = mergeText(config.text, lang, fb?.text);
  const wheel = config.wheel ? mergeWheel(config.wheel, lang, fb?.wheelPrizes) : undefined;
  const tapHearts = config.tapHearts ? mergeTapHearts(config.tapHearts, lang, fb?.tapHearts) : undefined;
  const scratch = config.scratch ? mergeScratch(config.scratch, lang, fb?.scratch) : undefined;
  const countdown = config.countdown ? mergeCountdown(config.countdown, lang, fb?.countdown) : undefined;
  const memory = config.memory ? mergeMemory(config.memory, lang, fb?.memory) : undefined;
  const campaign = mergeCampaignForLanguage(config.campaign, lang, fb?.campaign);

  return {
    ...config,
    text,
    wheel,
    tapHearts,
    scratch,
    countdown,
    memory,
    campaign,
  };
}
