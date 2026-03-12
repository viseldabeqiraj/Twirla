import { getApiBase } from '../config/api';
const getApiUrl = () => `${getApiBase()}/api`;

export interface AdminSummary {
  uniqueVisitors: number;
  impressions: number;
  starts: number;
  finishes: number;
  rewardsWon: number;
  couponsGenerated: number;
  couponsRedeemed: number;
  attributedRevenue: number;
}

export async function getAdminSummary(slug: string, token: string): Promise<AdminSummary> {
  const url = `${getApiUrl()}/admin/shops/${encodeURIComponent(slug)}/summary?token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? 'Invalid or missing token.');
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<AdminSummary>;
}

export interface DailyRevenuePoint {
  date: string;
  amount: number;
}

export async function getDailyRevenue(slug: string, token: string): Promise<DailyRevenuePoint[]> {
  const url = `${getApiUrl()}/admin/shops/${encodeURIComponent(slug)}/analytics/daily-revenue?token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? 'Invalid or missing token.');
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<DailyRevenuePoint[]>;
}

export async function redeemCoupon(
  slug: string,
  token: string,
  couponCode: string,
  orderValue: number
): Promise<void> {
  const url = `${getApiUrl()}/admin/shops/${encodeURIComponent(slug)}/redeem-coupon?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ couponCode, orderValue }),
  });
  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? 'Invalid or missing token.');
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`);
}
