import { ShopConfig } from '../types/ShopConfig';
import { getApiBase } from '../config/api';
import {
  fetchShopsFromJson,
  findEnabledShopByUrlSlug,
  findShopByUrlSlug,
  isShopAccessible,
  isShopEnabled,
  isShopExpired,
} from '../data/shopsJson';
import { applyShopConfigLanguage } from '../data/shopConfigLocale';

const getApiUrl = () => `${getApiBase()}/api`;

interface ShopsPayload {
  shops: ShopConfig[];
}

async function loadFromStaticJson(shopId: string, mode?: string, language?: string): Promise<ShopConfig> {
  const res = await fetch('/shops.json');
  if (!res.ok) {
    throw new Error('Static config file not found');
  }

  const payload = (await res.json()) as ShopsPayload;
  const target = payload.shops.find((shop) => shop.shopId === shopId);

  if (!target) {
    throw new Error(`Shop configuration not found for: ${shopId}${mode ? ` (mode: ${mode})` : ''}`);
  }

  if (!isShopAccessible(target)) {
    if (isShopExpired(target)) throw new Error('SHOP_EXPIRED');
    throw new Error('SHOP_DISABLED');
  }

  return applyShopConfigLanguage(target, language ?? 'en');
}

/** Find shop in static JSON by slug (explicit `slug` field or shopId prefix). */
async function loadFromStaticJsonBySlug(slug: string, _mode?: string, language?: string): Promise<ShopConfig> {
  const shops = await fetchShopsFromJson();
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

/** Safe parse JSON; returns null if response is HTML or invalid. */
async function parseJsonOrNull(response: Response): Promise<ShopConfig | null> {
  const text = await response.text();
  if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
    return null; // likely HTML (e.g. SPA index)
  }
  try {
    return JSON.parse(text) as ShopConfig;
  } catch {
    return null;
  }
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
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Shop not found');
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = await parseJsonOrNull(response);
    if (data) {
      if (!isShopAccessible(data)) {
        if (isShopExpired(data)) throw new Error('SHOP_EXPIRED');
        throw new Error('SHOP_DISABLED');
      }
      return applyShopConfigLanguage(data, language ?? 'en');
    }
  } catch {
    // fall through to static
  }
  return loadFromStaticJsonBySlug(slug, mode, language);
}

export async function fetchShopConfig(shopId: string, mode?: string, language?: string): Promise<ShopConfig> {
  const api = getApiUrl();
  const baseUrl = mode ? `${api}/config/${encodeURIComponent(shopId)}/${mode}` : `${api}/config/${encodeURIComponent(shopId)}`;
  const url = language ? `${baseUrl}?lang=${language}` : baseUrl;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Shop not found');
      throw new Error(`API request failed: ${response.status}`);
    }
    const data = await parseJsonOrNull(response);
    if (data) {
      if (!isShopAccessible(data)) {
        if (isShopExpired(data)) throw new Error('SHOP_EXPIRED');
        throw new Error('SHOP_DISABLED');
      }
      return applyShopConfigLanguage(data, language ?? 'en');
    }
    // Response was 200 but not JSON (e.g. SPA index.html when API base not set)
    throw new Error('Not JSON');
  } catch (e) {
    // Try static JSON by exact shopId first
    try {
      return await loadFromStaticJson(shopId, mode, language);
    } catch {
      // Try by slug (e.g. "pinkster-main" → slug "pinkster")
      const slugMatch = shopId.match(/^([a-z0-9-]+)-([a-z0-9]+)$/i);
      if (slugMatch) {
        return loadFromStaticJsonBySlug(slugMatch[1], mode);
      }
      throw e instanceof Error ? e : new Error('Shop not found');
    }
  }
}
