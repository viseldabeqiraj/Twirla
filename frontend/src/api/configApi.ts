import { ShopConfig } from '../types/ShopConfig';
import { getApiBase } from '../config/api';
import {
  fetchShopCatalog,
  findEnabledShopByUrlSlug,
  findShopByUrlSlug,
  isShopAccessible,
  isShopEnabled,
  isShopExpired,
} from '../data/shopCatalog';
import { applyShopConfigLanguage } from '../data/shopConfigLocale';

const getApiUrl = () => `${getApiBase()}/api`;

/** Safe parse JSON; returns null if response is HTML or invalid. */
async function parseJsonOrNull(response: Response): Promise<ShopConfig | null> {
  const text = await response.text();
  if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
    return null;
  }
  try {
    return JSON.parse(text) as ShopConfig;
  } catch {
    return null;
  }
}

async function loadFromCatalogBySlug(slug: string, language?: string): Promise<ShopConfig> {
  const shops = await fetchShopCatalog();
  const target = findEnabledShopByUrlSlug(slug, shops);
  if (!target) {
    const exists = findShopByUrlSlug(slug, shops);
    if (exists && !isShopEnabled(exists)) {
      throw new Error('SHOP_DISABLED');
    }
    if (exists && isShopExpired(exists)) {
      throw new Error('SHOP_EXPIRED');
    }
    throw new Error(`Shop configuration not found for slug: ${slug}`);
  }
  return applyShopConfigLanguage(target, language ?? 'en');
}

async function loadFromCatalogByShopId(shopId: string, language?: string): Promise<ShopConfig> {
  const shops = await fetchShopCatalog();
  const target = shops.find((shop) => shop.shopId === shopId);
  if (!target) {
    throw new Error(`Shop configuration not found for: ${shopId}`);
  }
  if (!isShopAccessible(target)) {
    if (isShopExpired(target)) throw new Error('SHOP_EXPIRED');
    throw new Error('SHOP_DISABLED');
  }
  return applyShopConfigLanguage(target, language ?? 'en');
}

/** Fetch config by slug (e.g. "pinkster", "demo") so URLs like /wheel/pinkster/any work. */
export async function fetchShopConfigBySlug(
  slug: string,
  mode?: string,
  language?: string
): Promise<ShopConfig> {
  const api = getApiUrl();
  const baseUrl = mode
    ? `${api}/config/by-slug/${encodeURIComponent(slug)}/${mode}`
    : `${api}/config/by-slug/${encodeURIComponent(slug)}`;
  const url = language ? `${baseUrl}?lang=${language}` : baseUrl;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      return loadFromCatalogBySlug(slug, language);
    }
    throw new Error(`Request failed: ${response.status}`);
  }
  const data = await parseJsonOrNull(response);
  if (!data) {
    return loadFromCatalogBySlug(slug, language);
  }
  if (!isShopAccessible(data)) {
    if (isShopExpired(data)) throw new Error('SHOP_EXPIRED');
    throw new Error('SHOP_DISABLED');
  }
  return applyShopConfigLanguage(data, language ?? 'en');
}

export async function fetchShopConfig(shopId: string, mode?: string, language?: string): Promise<ShopConfig> {
  const api = getApiUrl();
  const baseUrl = mode ? `${api}/config/${encodeURIComponent(shopId)}/${mode}` : `${api}/config/${encodeURIComponent(shopId)}`;
  const url = language ? `${baseUrl}?lang=${language}` : baseUrl;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        const slugMatch = shopId.match(/^([a-z0-9-]+)-([a-z0-9]+)$/i);
        if (slugMatch) {
          return fetchShopConfigBySlug(slugMatch[1], mode, language);
        }
        return loadFromCatalogByShopId(shopId, language);
      }
      throw new Error(`API request failed: ${response.status}`);
    }
    const data = await parseJsonOrNull(response);
    if (!data) {
      return loadFromCatalogByShopId(shopId, language);
    }
    if (!isShopAccessible(data)) {
      if (isShopExpired(data)) throw new Error('SHOP_EXPIRED');
      throw new Error('SHOP_DISABLED');
    }
    return applyShopConfigLanguage(data, language ?? 'en');
  } catch (e) {
    const slugMatch = shopId.match(/^([a-z0-9-]+)-([a-z0-9]+)$/i);
    if (slugMatch) {
      return fetchShopConfigBySlug(slugMatch[1], mode, language);
    }
    try {
      return await loadFromCatalogByShopId(shopId, language);
    } catch {
      throw e instanceof Error ? e : new Error('Shop not found');
    }
  }
}
