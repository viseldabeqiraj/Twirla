/** Wrap a URL for use inside CSS `url(...)` (query strings with `&` must be quoted). */
export function cssUrl(raw: string): string {
  const u = raw.trim().replace(/"/g, '\\"');
  return `url("${u}")`;
}
