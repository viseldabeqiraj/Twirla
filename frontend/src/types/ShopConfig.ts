export interface ShopConfig {
  shopId: string;
  playCooldownHours?: number; // Hours between plays (default 24)
  mode?: ExperienceMode; // Optional, determined by URL
  branding: BrandingConfig;
  text: TextConfig;
  cta: CtaConfig;
  wheel?: WheelConfig;
  tapHearts?: TapHeartsConfig;
  scratch?: ScratchConfig;
  countdown?: CountdownConfig;
}

export enum ExperienceMode {
  Wheel = "Wheel",
  TapHearts = "TapHearts",
  Scratch = "Scratch",
  Countdown = "Countdown"
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  brandName?: string;
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
  isWinning?: boolean; // null/undefined = auto-detect, true = winning, false = losing
}

export interface TapHeartsConfig {
  heartsToTap: number;
  heartColor: string;
  revealText: string;
  revealSubtitle?: string;
}

export interface ScratchConfig {
  overlayColor: string;
  overlayText: string;
  revealText: string;
  revealSubtitle?: string;
}

export interface CountdownConfig {
  endAt: string; // ISO 8601 string
  endMessage: string;
  showCtaBeforeEnd: boolean;
}

