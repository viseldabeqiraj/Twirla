/**
 * API and asset base URL for the backend.
 * - Dev (Vite proxy): leave unset → same-origin /api, /logos.
 * - Production (e.g. Cloudflare + Azure): set VITE_API_BASE to the backend root, e.g.
 *   https://twirla-xxx.azurewebsites.net
 */
const base = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE;
export const getApiBase = (): string => (typeof base === 'string' && base.trim() ? base.trim().replace(/\/$/, '') : '');

/** Resolve asset path (e.g. /logos/twirla.png) to full URL when backend is on another origin. */
export function resolveAssetUrl(path: string): string {
  const apiBase = getApiBase();
  if (!apiBase || !path || !path.startsWith('/')) return path;
  return `${apiBase}${path}`;
}
