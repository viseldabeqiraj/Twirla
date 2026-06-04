import type { ShopConfig } from '../types/ShopConfig';
import { getApiBase } from '../config/api';

export interface ShopCatalogResponse {
  shops: ShopConfig[];
}

let cache: ShopConfig[] | null = null;

/**
 * Load all shop configs from the API (`GET /api/config/shops`).
 * Call `clearShopCatalogCache()` after remote edits in the same tab if needed.
 */
export async function fetchShopCatalog(): Promise<ShopConfig[]> {
  if (cache) return cache;
  const base = getApiBase();
  const res = await fetch(`${base}/api/config/shops`);
  if (!res.ok) {
    throw new Error(`Shop catalog failed: ${res.status}`);
  }
  const data = (await res.json()) as ShopCatalogResponse;
  if (!data.shops || !Array.isArray(data.shops)) {
    throw new Error('Shop catalog: invalid shape');
  }
  cache = data.shops;
  return cache;
}

export function clearShopCatalogCache(): void {
  cache = null;
}

export function isShopEnabled(shop: ShopConfig): boolean {
  return shop.enabled !== false;
}

export function isShopExpired(shop: ShopConfig): boolean {
  const raw = shop.expiresAt?.trim();
  if (!raw) return false;
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return false;
  return Date.now() >= t;
}

/** Enabled and not past optional expiresAt (client-side guard). */
export function isShopAccessible(shop: ShopConfig): boolean {
  return isShopEnabled(shop) && !isShopExpired(shop);
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

/** Same as {@link findShopByUrlSlug} but only shops available on public URLs (enabled + not expired). */
export function findEnabledShopByUrlSlug(urlSlug: string, shops: ShopConfig[]): ShopConfig | undefined {
  const hit = findShopByUrlSlug(urlSlug, shops);
  return hit && isShopAccessible(hit) ? hit : undefined;
}
