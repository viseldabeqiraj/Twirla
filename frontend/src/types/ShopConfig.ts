export interface ShopConfig {
  shopId: string;
  playCooldownHours?: number;
  mode?: ExperienceMode;
  branding: BrandingConfig;
  text: TextConfig;
  cta: CtaConfig;
  wheel?: WheelConfig;
  tapHearts?: TapHeartsConfig;
  scratch?: ScratchConfig;
  countdown?: CountdownConfig;
}

export enum ExperienceMode {
  Wheel = 'Wheel',
  TapHearts = 'TapHearts',
  Scratch = 'Scratch',
  Countdown = 'Countdown',
}

export interface ThemeConfig {
  backgroundPattern?: 'gradient' | 'aurora' | 'mesh' | 'dark';
  surfaceStyle?: 'glass' | 'solid' | 'neon';
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
  endAt: string;
  endMessage: string;
  showCtaBeforeEnd: boolean;
}
