import { ShopConfig } from '../types/ShopConfig';
import { getApiBase } from '../config/api';

const getApiUrl = () => `${getApiBase()}/api`;

interface ShopsPayload {
  shops: ShopConfig[];
}

async function loadFromStaticJson(shopId: string, mode?: string): Promise<ShopConfig> {
  const res = await fetch('/shops.json');
  if (!res.ok) {
    throw new Error('Static config file not found');
  }

  const payload = (await res.json()) as ShopsPayload;
  const target = payload.shops.find((shop) => shop.shopId === shopId);

  if (!target) {
    throw new Error(`Shop configuration not found for: ${shopId}${mode ? ` (mode: ${mode})` : ''}`);
  }

  // For static hosting fallback we keep config as-is.
  // Language-specific merged values are expected to be pre-resolved by API,
  // but the frontend translations still cover shared copy.
  return target;
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
    if (response.status === 404) throw new Error('Shop not found');
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as ShopConfig;
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

    const data = await response.json();
    return data as ShopConfig;
  } catch (e) {
    // Cloudflare static hosting fallback
    if (e instanceof Error && e.message !== 'Shop not found') throw e;
    return loadFromStaticJson(shopId, mode);
  }
}
