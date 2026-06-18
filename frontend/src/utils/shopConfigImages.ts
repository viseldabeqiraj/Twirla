import type { ShopConfig } from '../types/ShopConfig';
import type { FeaturedProductConfig } from '../types/ShopLandingConfig';

export type ShopImageSlotId =
  | 'branding.logoUrl'
  | 'campaign.hero.backgroundImageUrl'
  | 'campaign.about.ownerPhotoUrl'
  | `campaign.featuredProducts.${number}.imageUrl`;

export interface ShopImageSlot {
  id: ShopImageSlotId;
  label: string;
  url: string;
  productTitle?: string;
}

export function collectShopImageSlots(config: ShopConfig): ShopImageSlot[] {
  const slots: ShopImageSlot[] = [
    {
      id: 'branding.logoUrl',
      label: 'Logo',
      url: config.branding?.logoUrl?.trim() ?? '',
    },
    {
      id: 'campaign.hero.backgroundImageUrl',
      label: 'Hero background',
      url: config.campaign?.hero?.backgroundImageUrl?.trim() ?? '',
    },
    {
      id: 'campaign.about.ownerPhotoUrl',
      label: 'About photo',
      url: config.campaign?.about?.ownerPhotoUrl?.trim() ?? '',
    },
  ];

  const products = config.campaign?.featuredProducts ?? [];
  products.forEach((p, index) => {
    slots.push({
      id: `campaign.featuredProducts.${index}.imageUrl`,
      label: `Product ${index + 1}${p.title ? `: ${p.title}` : ''}`,
      url: p.imageUrl?.trim() ?? '',
      productTitle: p.title,
    });
  });

  return slots;
}

export function setShopImageUrl(config: ShopConfig, slotId: ShopImageSlotId, url: string): ShopConfig {
  const next = structuredClone(config);
  const trimmed = url.trim();

  switch (slotId) {
    case 'branding.logoUrl':
      next.branding = { ...next.branding, logoUrl: trimmed || undefined };
      break;
    case 'campaign.hero.backgroundImageUrl': {
      next.campaign = { ...next.campaign };
      next.campaign.hero = {
        ...next.campaign.hero,
        backgroundImageUrl: trimmed || undefined,
        backgroundStyle: trimmed ? (next.campaign.hero?.backgroundStyle ?? 'solid') : next.campaign.hero?.backgroundStyle,
        backgroundImageOverlay: trimmed
          ? (next.campaign.hero?.backgroundImageOverlay ?? 'dark')
          : next.campaign.hero?.backgroundImageOverlay,
      };
      break;
    }
    case 'campaign.about.ownerPhotoUrl': {
      next.campaign = { ...next.campaign };
      next.campaign.about = { ...next.campaign.about, ownerPhotoUrl: trimmed || undefined };
      break;
    }
    default: {
      const match = /^campaign\.featuredProducts\.(\d+)\.imageUrl$/.exec(slotId);
      if (!match) return next;
      const index = Number(match[1]);
      next.campaign = { ...next.campaign };
      const products = [...(next.campaign.featuredProducts ?? [])];
      while (products.length <= index) {
        products.push({
          id: `product-${products.length + 1}`,
          title: `Product ${products.length + 1}`,
        } as FeaturedProductConfig);
      }
      products[index] = { ...products[index], imageUrl: trimmed || undefined };
      next.campaign.featuredProducts = products;
      break;
    }
  }

  return next;
}

export function addFeaturedProductSlot(config: ShopConfig): ShopConfig {
  const next = structuredClone(config);
  next.campaign = { ...next.campaign };
  const products = [...(next.campaign.featuredProducts ?? [])];
  const n = products.length + 1;
  products.push({
    id: `product-${n}`,
    title: `Product ${n}`,
    description: '',
    imageUrl: undefined,
  });
  next.campaign.featuredProducts = products;
  return next;
}

export function parseShopConfigJson(json: string): ShopConfig | null {
  try {
    return JSON.parse(json) as ShopConfig;
  } catch {
    return null;
  }
}
