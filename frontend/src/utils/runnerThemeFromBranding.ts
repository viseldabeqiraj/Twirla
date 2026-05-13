import type { RunnerTheme } from '../games/runner/runnerTypes';
import type { ShopSpotPalette } from '../types/ShopSpotPalette';
import { darken, getRelativeLuminance, lighten, mix } from '../theme/shopTheme';

/** Minimum perceived lightness gap between ground and runner/obstacle fills */
const MIN_LUM_GAP = 0.14;

function ensureContrastAgainstGround(fillHex: string, groundHex: string): string {
  const gl = getRelativeLuminance(groundHex);
  const adjust =
    gl > 0.45
      ? (hex: string) => darken(hex, 0.08)
      : (hex: string) => lighten(hex, 0.08);
  let out = fillHex;
  let gap = getRelativeLuminance(out) - gl;
  let guard = 0;
  while (gap < MIN_LUM_GAP && guard < 12) {
    out = adjust(out);
    gap = getRelativeLuminance(out) - gl;
    guard += 1;
  }
  return out;
}

/**
 * Builds canvas colors from shop branding so runner stays readable on every palette:
 * sky is always light; ground stays darker; character favors accent when primary is near-black.
 * With `spotPalette`, sky/ground/obstacle map to wash/deep/muted for a distinct in-game look.
 */
export function runnerThemeFromBranding(
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
  },
  spotPalette?: ShopSpotPalette,
): RunnerTheme {
  if (spotPalette) {
    const p = spotPalette;
    /** Darkest shop tone for the runway strip */
    const ground = mix(p.deep, '#020617', 0.04);
    /** Bright sky — stay in wash/white, never blend toward `ground` */
    const highlight = mix(p.wash, '#ffffff', 0.82);
    const skyHorizon = mix(p.wash, p.muted, 0.08);
    /** Shop primary = hero / CTA color on cards */
    let character = branding.primaryColor;
    character = ensureContrastAgainstGround(character, ground);
    let obstacle = mix(p.muted, p.wash, 0.12);
    obstacle = darken(obstacle, 0.06);
    obstacle = ensureContrastAgainstGround(obstacle, ground);
    const skyTop = mix(highlight, '#ffffff', 0.55);
    const skyMid = mix(highlight, skyHorizon, 0.38);
    const skyBot = mix(skyHorizon, p.wash, 0.22);
    const background = `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 52%, ${skyBot} 100%)`;
    return {
      background,
      accent: character,
      highlight,
      skyHorizon,
      ground,
      obstacleColor: obstacle,
    };
  }

  const primary = branding.primaryColor;
  const secondary = branding.secondaryColor;
  const accent = branding.accentColor ?? primary;

  // Sky: light top → airy horizon (never pull `ground` into the sky gradient; draw handles horizon)
  const skyCore = mix(accent, '#ffffff', 0.86);
  const highlight = mix('#ffffff', skyCore, 0.58);
  const skyHorizon = mix(skyCore, '#f1f5f9', 0.52);

  // Ground band: darker shop secondary / slate
  const ground = mix(mix(secondary, '#0f172a', 0.62), '#020617', 0.28);

  const primaryLum = getRelativeLuminance(primary);
  let character =
    primaryLum < 0.11 ? accent : mix(primary, accent, 0.62);
  character = ensureContrastAgainstGround(character, ground);

  let obstacle = darken(mix(accent, primary, 0.55), 0.06);
  if (Math.abs(getRelativeLuminance(obstacle) - getRelativeLuminance(ground)) < MIN_LUM_GAP) {
    obstacle = mix(accent, '#ffffff', 0.58);
    obstacle = darken(obstacle, 0.12);
  }
  obstacle = ensureContrastAgainstGround(obstacle, ground);

  const skyTop = mix(highlight, '#ffffff', 0.62);
  const skyMid = mix(highlight, skyHorizon, 0.42);
  const skyBot = mix(skyHorizon, '#ffffff', 0.35);
  const background = `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 52%, ${skyBot} 100%)`;

  return {
    background,
    accent: character,
    highlight,
    skyHorizon,
    ground,
    obstacleColor: obstacle,
  };
}
