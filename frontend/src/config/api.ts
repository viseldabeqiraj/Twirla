/**
 * API and asset base URL for the backend.
 * - Dev (Vite proxy): leave unset → same-origin /api, /logos.
 * - Production (e.g. Cloudflare + Azure): set VITE_API_BASE to the backend root, e.g.
 *   https://twirla-xxx.azurewebsites.net
 */
const base = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE;
export const getApiBase = (): string => (typeof base === 'string' && base.trim() ? base.trim().replace(/\/$/, '') : '');

/** True when the value is already an absolute http(s) URL (e.g. static.zara.net product photos). */
export function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path.trim());
}

/** Resolve asset path (e.g. /logos/twirla.png) to full URL when backend is on another origin. */
export function resolveAssetUrl(path: string): string {
  const trimmed = path?.trim() ?? '';
  if (!trimmed) return trimmed;
  if (isAbsoluteUrl(trimmed)) return trimmed;
  const apiBase = getApiBase();
  if (!apiBase || !trimmed.startsWith('/')) return trimmed;
  return `${apiBase}${trimmed}`;
}
