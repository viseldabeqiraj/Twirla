export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  if (isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((c) =>
        Math.round(Math.max(0, Math.min(255, c)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const [nr, ng, nb] = hslToRgb(h, s, Math.min(1, l + amount));
  return rgbToHex(nr, ng, nb);
}

export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const [nr, ng, nb] = hslToRgb(h, s, Math.max(0, l - amount));
  return rgbToHex(nr, ng, nb);
}

export function mix(hex: string, target: string, amount: number): string {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(target);
  return rgbToHex(
    Math.round(r1 + (r2 - r1) * amount),
    Math.round(g1 + (g2 - g1) * amount),
    Math.round(b1 + (b2 - b1) * amount),
  );
}

export function getRelativeLuminance(hex: string): number {
  const channels = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function getContrastText(bgHex: string): string {
  return getRelativeLuminance(bgHex) > 0.35 ? '#0f172a' : '#ffffff';
}

export function buildGradient(primary: string, secondary: string, angle = 135): string {
  return `linear-gradient(${angle}deg, ${primary}, ${secondary})`;
}

function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/** Nudge secondary if it's perceptually too close to primary */
function ensureColorContrast(primary: string, secondary: string): string {
  if (colorDistance(primary, secondary) < 55) {
    const [r, g, b] = hexToRgb(secondary);
    const [h, s, l] = rgbToHsl(r, g, b);
    const newH = (h + 0.06) % 1;
    const newL = l > 0.5 ? Math.max(0, l - 0.15) : Math.min(1, l + 0.15);
    const [nr, ng, nb] = hslToRgb(newH, Math.min(1, s + 0.05), newL);
    return rgbToHex(nr, ng, nb);
  }
  return secondary;
}

function deriveAccent(primary: string): string {
  return lighten(primary, 0.22);
}

// ---------------------------------------------------------------------------
// Theme token computation
// ---------------------------------------------------------------------------

export type BackgroundMode = 'light' | 'dark';

export interface ShopThemeInput {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundMode?: BackgroundMode;
  logoBackgroundColor?: string;
}

export interface ShopThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  backgroundMode: BackgroundMode;

  pageBackground: string;
  cardBackground: string;
  buttonGradient: string;
  buttonTextColor: string;
  headingColor: string;
  bodyTextColor: string;
  borderColor: string;
  subtleGlowColor: string;
  mutedTextColor: string;

  primaryLight: string;
  primaryDark: string;
  surfaceTint: string;
  logoBackground: string;
}

export function getShopTheme(input: ShopThemeInput): ShopThemeTokens {
  const primary = input.primaryColor;
  const secondary = ensureColorContrast(primary, input.secondaryColor);
  const accent = input.accentColor || deriveAccent(primary);
  const mode = input.backgroundMode ?? 'light';
  const isLight = mode === 'light';

  const primaryLight = lighten(primary, 0.25);
  const primaryDark = darken(primary, 0.15);
  const surfaceTint = isLight
    ? mix(primary, '#ffffff', 0.92)
    : mix(primary, '#0f172a', 0.85);

  return {
    primary,
    secondary,
    accent,
    backgroundMode: mode,

    pageBackground: isLight
      ? `linear-gradient(180deg, ${mix(primary, '#ffffff', 0.94)} 0%, ${mix(accent, '#ffffff', 0.9)} 34%, ${mix(secondary, '#ffffff', 0.92)} 68%, #f8fafc 100%)`
      : `linear-gradient(180deg, ${mix(primary, '#000000', 0.82)} 0%, ${mix(secondary, '#0f172a', 0.75)} 50%, #0f172a 100%)`,

    cardBackground: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(15,23,42,0.92)',
    buttonGradient: buildGradient(primary, secondary),
    buttonTextColor: getContrastText(primary),

    headingColor: isLight ? '#0f172a' : '#f1f5f9',
    bodyTextColor: isLight ? '#334155' : '#cbd5e1',
    borderColor: isLight
      ? mix(primary, '#ffffff', 0.8)
      : mix(accent, '#0f172a', 0.7),
    subtleGlowColor: mix(primary, '#ffffff', 0.78),
    mutedTextColor: isLight ? '#64748b' : '#94a3b8',

    primaryLight,
    primaryDark,
    surfaceTint,
    logoBackground:
      input.logoBackgroundColor ||
      (isLight ? mix(primary, '#ffffff', 0.88) : mix(primary, '#0f172a', 0.7)),
  };
}

export function themeTokensToCssVars(
  tokens: ShopThemeTokens,
): Record<string, string> {
  return {
    // Derived theme tokens
    '--tw-primary': tokens.primary,
    '--tw-secondary': tokens.secondary,
    '--tw-accent': tokens.accent,
    '--tw-bg-mode': tokens.backgroundMode,
    '--tw-page-bg': tokens.pageBackground,
    '--tw-card-bg': tokens.cardBackground,
    '--tw-btn-gradient': tokens.buttonGradient,
    '--tw-btn-text': tokens.buttonTextColor,
    '--tw-heading-color': tokens.headingColor,
    '--tw-body-color': tokens.bodyTextColor,
    '--tw-border-color': tokens.borderColor,
    '--tw-glow-color': tokens.subtleGlowColor,
    '--tw-muted-color': tokens.mutedTextColor,
    '--tw-primary-light': tokens.primaryLight,
    '--tw-primary-dark': tokens.primaryDark,
    '--tw-surface-tint': tokens.surfaceTint,
    '--tw-logo-bg': tokens.logoBackground,

    // Backward compat with existing CSS that references these names
    '--shop-primary': tokens.primary,
    '--shop-secondary': tokens.secondary,
    '--shop-accent': tokens.accent,
    '--primary-color': tokens.primary,
    '--secondary-color': tokens.secondary,
    '--accent-color': tokens.accent,
  };
}
