import type { RunnerTheme } from '../games/runner/runnerTypes';
import { darken, getRelativeLuminance, lighten, mix } from '../theme/shopTheme';

/** Minimum perceived lightness gap between ground and runner/obstacle fills */
const MIN_LUM_GAP = 0.14;

function ensureContrastAgainstGround(fillHex: string, groundHex: string): string {
  let out = fillHex;
  let gap = getRelativeLuminance(out) - getRelativeLuminance(groundHex);
  let guard = 0;
  while (gap < MIN_LUM_GAP && guard < 12) {
    out = lighten(out, 0.08);
    gap = getRelativeLuminance(out) - getRelativeLuminance(groundHex);
    guard += 1;
  }
  return out;
}

/**
 * Builds canvas colors from shop branding so runner stays readable on every palette:
 * sky is always light; ground stays darker; character favors accent when primary is near-black.
 */
export function runnerThemeFromBranding(branding: {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
}): RunnerTheme {
  const primary = branding.primaryColor;
  const secondary = branding.secondaryColor;
  const accent = branding.accentColor ?? primary;

  // Sky (gradient top): always wash toward white so it reads as daylight
  const skyCore = mix(accent, '#ffffff', 0.86);
  const highlight = mix(skyCore, '#f8fafc', 0.45);

  // Ground band + lower gradient: anchored dark but not identical to pure primary black
  const ground = mix(mix(secondary, '#0f172a', 0.62), '#020617', 0.28);

  const primaryLum = getRelativeLuminance(primary);
  let character =
    primaryLum < 0.11 ? accent : mix(primary, accent, 0.42);
  character = ensureContrastAgainstGround(character, ground);

  let obstacle = darken(mix(accent, primary, 0.55), 0.06);
  if (Math.abs(getRelativeLuminance(obstacle) - getRelativeLuminance(ground)) < MIN_LUM_GAP) {
    obstacle = mix(accent, '#ffffff', 0.58);
    obstacle = darken(obstacle, 0.12);
  }
  obstacle = ensureContrastAgainstGround(obstacle, ground);

  // Card / shell gradient aligned with canvas sky (RunnerGame --runner-bg)
  const skyTop = mix(highlight, '#ffffff', 0.68);
  const skyMid = mix(highlight, '#ffffff', 0.42);
  const skyBot = mix(highlight, skyCore, 0.38);
  const background = `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 52%, ${skyBot} 100%)`;

  return {
    background,
    accent: character,
    highlight,
    ground,
    obstacleColor: obstacle,
  };
}
