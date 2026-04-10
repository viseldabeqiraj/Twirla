export interface ShopConfig {
  shopId: string;
  /** When false, shop landing and game URLs return nothing (Twirla-side offboarding). Omitted defaults to true. */
  enabled?: boolean;
  /** Public URL slug for /shop/:slug and /:mode/:slug/:id */
  slug?: string;
  /** Display name from admin / JSON (optional; falls back to branding.brandName). */
  name?: string;
  adminToken?: string;
  playCooldownHours?: number;
  mode?: ExperienceMode;
  branding: BrandingConfig;
  text: TextConfig;
  cta: CtaConfig;
  wheel?: WheelConfig;
  tapHearts?: TapHeartsConfig;
  scratch?: ScratchConfig;
  countdown?: CountdownConfig;
  /** Flip cards to match pairs; MVP uses emoji/symbol deck */
  memory?: MemoryMatchConfig;
  /** Runner (/runner/...) — weighted end-of-round prize copy */
  runnerGame?: RunnerGameSettings;
  /** Public campaign landing content (shops.json only — no hardcoded shops). */
  campaign?: import('./ShopCampaign').ShopCampaignPageConfig;
}

export enum ExperienceMode {
  Runner = 'Runner',
  Wheel = 'Wheel',
  TapHearts = 'TapHearts',
  Scratch = 'Scratch',
  Countdown = 'Countdown',
  MemoryMatch = 'MemoryMatch',
}

/** Soft drifting shapes behind the experience card (opt-in; keep density low). */
export interface AmbientParticlesConfig {
  /** When true, shows a small number of particles. Omitted or false = off. */
  enabled?: boolean;
  /** Default "orb" — soft blob; "dot" — tiny specks; "ring" — hollow circles. */
  shape?: 'dot' | 'orb' | 'ring';
  /** Default "few" (~6); "some" is still restrained (~10). */
  density?: 'few' | 'some';
  /** Optional CSS color (e.g. hex). Defaults to a wash of brand primary/secondary. */
  color?: string;
  /** Optional second tone for variety. */
  accentColor?: string;
}

export interface ThemeConfig {
  backgroundPattern?: 'gradient' | 'aurora' | 'mesh' | 'dark';
  surfaceStyle?: 'glass' | 'solid' | 'neon';
  /** Optional motion on background orbs (accessibility: use "none" to reduce movement). */
  ambientMotion?: 'none' | 'drift' | 'pulse' | 'shimmer';
  /** Optional very subtle floating particles (brand-colored; respects reduced motion). */
  ambientParticles?: AmbientParticlesConfig;
  fontFamily?: string;
  borderRadius?: number;
  buttonRadius?: number;
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  brandName?: string;
  accentColor?: string;
  theme?: ThemeConfig;
}

export interface TextConfig {
  title: string;
  subtitle?: string;
  ctaText: string;
  resultTitle: string;
  resultSubtitle?: string;
}

export interface CtaConfig {
  url: string;
}

export interface WheelConfig {
  allowRepeatSpins: boolean;
  prizes: PrizeConfig[];
}

export interface PrizeConfig {
  label: string;
  weight: number;
  iconUrl?: string;
  description?: string;
  isWinning?: boolean;
}

/** Weighted random result when Catch the Prize ends (replaces score-based tiers). */
export interface TapHeartsOutcome {
  headline: string;
  description?: string;
  weight: number;
  /** True = no discount / no prize this round. */
  isNoWin?: boolean;
}

export interface TapHeartsConfig {
  heartsToTap: number;
  heartColor: string;
  revealText: string;
  revealSubtitle?: string;
  /** If set, one row is picked at random by weight when the round ends. If omitted, built-in defaults apply. */
  outcomes?: TapHeartsOutcome[];
}

/** Weighted random result when Runner mode ends. */
export interface RunnerGameOutcome {
  headline: string;
  body?: string;
  weight: number;
  isNoWin?: boolean;
}

export interface RunnerGameSettings {
  outcomes?: RunnerGameOutcome[];
}

export interface ScratchConfig {
  overlayColor: string;
  overlayText: string;
  revealText: string;
  revealSubtitle?: string;
}

export interface CountdownConfig {
  endAt: string;
  endMessage: string;
  showCtaBeforeEnd: boolean;
}

export interface MemoryMatchConfig {
  /** Number of pairs (3–8). Total cards = 2 × pairCount */
  pairCount: number;
  /** Shown when all pairs are found */
  revealText: string;
  revealSubtitle?: string;
  /** Optional labels for pairs (length must equal pairCount); default emoji deck if omitted */
  pairLabels?: string[];
  /** Seconds to match all pairs from “Start”; omit for no time limit */
  timeLimitSeconds?: number;
  /** Game ends after this many wrong pairs; omit for unlimited */
  maxMistakes?: number;
}
