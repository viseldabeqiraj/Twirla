import type { ShopConfig } from '../types/ShopConfig';
import { getApiBase } from '../config/api';

function apiPrefix(): string {
  const b = getApiBase();
  return b ? `${b.replace(/\/$/, '')}/api` : '/api';
}

export type ShopListItem = {
  shopId: string;
  slug?: string;
  name?: string;
  brandName?: string;
  enabled: boolean;
  expiresAt?: string;
  primaryColor: string;
  updatedAt: string;
  gameModes: string[];
};

async function shopBuilderFetch(
  path: string,
  sessionToken: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${apiPrefix()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
}

async function parseShopBuilderError(res: Response): Promise<never> {
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('SESSION_EXPIRED');
  if (res.status === 503) {
    const msg = typeof data?.error === 'string' ? data.error : 'NOT_CONFIGURED';
    throw new Error(msg);
  }
  const msg = typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`;
  throw new Error(msg);
}

export async function uploadShopAsset(
  file: File,
  shopSlug: string,
  purpose: string,
  sessionToken: string
): Promise<{ url: string; key: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('shopSlug', shopSlug);
  form.append('purpose', purpose);

  const res = await fetch(`${apiPrefix()}/shop-builder/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${sessionToken}` },
    body: form,
  });

  if (!res.ok) await parseShopBuilderError(res);
  return (await res.json()) as { url: string; key: string };
}

export async function listShopsInDatabase(sessionToken: string): Promise<ShopListItem[]> {
  const res = await shopBuilderFetch('/shop-builder/shops', sessionToken);
  if (!res.ok) await parseShopBuilderError(res);
  const data = (await res.json()) as { shops?: ShopListItem[] };
  return data.shops ?? [];
}

export async function getShopFromDatabase(shopId: string, sessionToken: string): Promise<ShopConfig> {
  const res = await shopBuilderFetch(`/shop-builder/shops/${encodeURIComponent(shopId)}`, sessionToken);
  if (!res.ok) await parseShopBuilderError(res);
  const data = (await res.json()) as { shop?: ShopConfig };
  if (!data.shop) throw new Error('Shop not found in response.');
  return data.shop;
}

export type CreateShopResponse = {
  shop: ShopConfig;
  adminToken: string;
  landingUrl: string;
  adminUrl: string;
  experiencePathShopId: string;
  gameUrls: { mode: string; url: string }[];
};

export async function createShopInDatabase(
  config: ShopConfig,
  sessionToken: string
): Promise<CreateShopResponse> {
  const res = await shopBuilderFetch('/shop-builder/shops', sessionToken, {
    method: 'POST',
    body: JSON.stringify(config),
  });
  if (!res.ok) await parseShopBuilderError(res);
  return (await res.json()) as CreateShopResponse;
}

export async function updateShopInDatabase(
  shopId: string,
  config: ShopConfig,
  sessionToken: string
): Promise<CreateShopResponse> {
  const res = await shopBuilderFetch(`/shop-builder/shops/${encodeURIComponent(shopId)}`, sessionToken, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
  if (!res.ok) await parseShopBuilderError(res);
  return (await res.json()) as CreateShopResponse;
}
