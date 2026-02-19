import { ShopConfig } from '../types/ShopConfig';

const API_BASE_URL = '/api';

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

export async function fetchShopConfig(shopId: string, mode?: string, language?: string): Promise<ShopConfig> {
  const baseUrl = mode ? `${API_BASE_URL}/config/${shopId}/${mode}` : `${API_BASE_URL}/config/${shopId}`;
  const url = language ? `${baseUrl}?lang=${language}` : baseUrl;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  } catch {
    // Cloudflare static hosting fallback
    return loadFromStaticJson(shopId, mode);
  }
}
