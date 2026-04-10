import type { ShopConfig } from '../types/ShopConfig';

export interface ShopsFilePayload {
  shops: ShopConfig[];
}

let cache: ShopConfig[] | null = null;

/**
 * Load `/shops.json` (synced with backend Twirla.Api/Data/shops.json for local dev).
 * Call `clearShopsJsonCache()` after edits in the same tab if needed.
 */
export async function fetchShopsFromJson(): Promise<ShopConfig[]> {
  if (cache) return cache;
  const res = await fetch('/shops.json');
  if (!res.ok) {
    throw new Error(`shops.json failed: ${res.status}`);
  }
  const data = (await res.json()) as ShopsFilePayload;
  if (!data.shops || !Array.isArray(data.shops)) {
    throw new Error('shops.json: invalid shape');
  }
  cache = data.shops;
  return cache;
}

export function clearShopsJsonCache(): void {
  cache = null;
}

export function isShopEnabled(shop: ShopConfig): boolean {
  return shop.enabled !== false;
}

/**
 * Resolve shop row by public slug: explicit `slug` field, shopId prefix `slug-`, or exact shopId.
 * Includes disabled shops; use {@link findEnabledShopByUrlSlug} for public routes.
 */
export function findShopByUrlSlug(urlSlug: string, shops: ShopConfig[]): ShopConfig | undefined {
  const s = urlSlug.trim().toLowerCase();
  if (!s) return undefined;
  return shops.find((shop) => {
    if (shop.slug?.toLowerCase() === s) return true;
    const id = shop.shopId.toLowerCase();
    if (id === s) return true;
    return id.startsWith(`${s}-`);
  });
}

/** Same as {@link findShopByUrlSlug} but only shops with `enabled !== false`. */
export function findEnabledShopByUrlSlug(urlSlug: string, shops: ShopConfig[]): ShopConfig | undefined {
  const hit = findShopByUrlSlug(urlSlug, shops);
  return hit && isShopEnabled(hit) ? hit : undefined;
}
