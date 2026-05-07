import type { ShopConfig } from '../types/ShopConfig';

export interface ShopsFilePayload {
  shops: ShopConfig[];
}

let cache: ShopConfig[] | null = null;

/**
 * Load `/shops.json` (sync from backend `Data/shops-prod.json` for local dev / static hosting).
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

export function isShopExpired(shop: ShopConfig): boolean {
  const raw = shop.expiresAt?.trim();
  if (!raw) return false;
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return false;
  return Date.now() >= t;
}

/** Enabled and not past optional expiresAt (client-side guard for static shops.json). */
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
