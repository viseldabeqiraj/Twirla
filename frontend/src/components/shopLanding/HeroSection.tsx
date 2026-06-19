import type { CSSProperties, MouseEvent } from 'react';
import { useTranslation } from '../../i18n/i18n';
import type { HeroConfig } from '../../types/ShopLandingConfig';
import { resolveAssetUrl } from '../../config/api';
import { cssUrl } from '../../utils/cssUrl';
import AnimatedPrimaryButton from '../twirla-ui/AnimatedPrimaryButton';
import StaggeredEntrance from '../twirla-ui/StaggeredEntrance';

interface HeroSectionProps {
  hero: HeroConfig;
  hideBar?: boolean;
  scrollToId?: string;
}

const IMAGE_OVERLAY_CLASS: Record<'dark' | 'medium' | 'light', string> = {
  dark: 'shop-hero-img-dark',
  medium: 'shop-hero-img-medium',
  light: 'shop-hero-img-light',
};

export default function HeroSection({ hero, hideBar = false, scrollToId }: HeroSectionProps) {
  const { t } = useTranslation();
  const primary = hero.primaryColor ?? '#db2777';
  const secondary = hero.secondaryColor ?? '#be185d';
  const isGradient = hero.backgroundStyle !== 'solid';
  const initial = hero.shopName.trim().charAt(0).toUpperCase() || '?';
  const headline = hero.headline ?? t('campaign.headline');
  const ctaLabel = scrollToId ? t('campaign.ctaPlayWin') : (hero.cta?.label ?? t('campaign.ctaPlayWin'));

  const handleCtaClick = (e: MouseEvent) => {
    if (scrollToId) {
      e.preventDefault();
      document.getElementById(scrollToId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const ctaHref = scrollToId ? `#${scrollToId}` : hero.cta?.url ?? '#';
  const isAnchor = !!scrollToId;

  const rawBg = hero.backgroundImageUrl?.trim();
  const resolvedBg = rawBg ? resolveAssetUrl(rawBg) : '';
  const hasImage = !!resolvedBg;
  const overlayKey = hero.backgroundImageOverlay ?? 'dark';
  const overlay: 'dark' | 'medium' | 'light' =
    overlayKey === 'light' || overlayKey === 'medium' ? overlayKey : 'dark';

  const pattern = hero.backgroundPattern;
  const patternClass =
    !hasImage && pattern && pattern !== 'none' ? `shop-hero-pattern-${pattern}` : '';

  let innerToneClass = '';
  if (hasImage) {
    innerToneClass = `shop-hero-with-image ${IMAGE_OVERLAY_CLASS[overlay]}`;
  }

  const innerClassName = [
    'shop-hero-inner',
    hasImage ? innerToneClass : isGradient ? 'shop-hero-gradient' : 'shop-hero-solid',
    patternClass,
  ]
    .filter(Boolean)
    .join(' ');

  const innerStyle: CSSProperties = hasImage
    ? ({
        '--shop-hero-image': cssUrl(resolvedBg),
      } as CSSProperties)
    : {};

  const ctaNode = isAnchor ? (
    <AnimatedPrimaryButton
      type="button"
      block
      className="shop-hero-cta shop-hero-cta-button"
      onClick={handleCtaClick}
      aria-label={ctaLabel}
    >
      {ctaLabel}
    </AnimatedPrimaryButton>
  ) : (
    <AnimatedPrimaryButton href={ctaHref} external block className="shop-hero-cta">
      {ctaLabel}
    </AnimatedPrimaryButton>
  );

  /** Sticky app header already shows logo/name when `hideBar` — avoid repeating on the hero card. */
  const showHeroBranding = !hideBar;

  const staggerItems = [
    ...(showHeroBranding
      ? [
          <div key="logo" className="shop-hero-logo-wrap">
            {hero.logoUrl ? (
              <img
                src={resolveAssetUrl(hero.logoUrl)}
                alt={hero.shopName}
                className="shop-hero-logo"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="shop-hero-logo-placeholder" aria-hidden>
                {initial}
              </span>
            )}
          </div>,
          <p key="shop" className="shop-hero-shop-name">
            {hero.shopName}
          </p>,
        ]
      : []),
    <h1 key="title" className="shop-hero-title">
      {headline}
    </h1>,
    <p key="tag" className="shop-hero-tagline">
      {hero.tagline}
    </p>,
    <div key="cta" className="shop-hero-cta-wrap shop-landing-cta-invite">
      {ctaNode}
    </div>,
  ];

  return (
    <header
      className="shop-hero"
      style={
        {
          '--shop-primary': primary,
          '--shop-secondary': secondary,
          '--primary-color': primary,
          '--accent-color': primary,
        } as CSSProperties
      }
    >
      <div className={`shop-hero-bar ${hideBar ? 'shop-hero-bar-hidden' : ''}`}>
        <div className="shop-hero-bar-logo">
          {hero.logoUrl ? (
            <img
              src={resolveAssetUrl(hero.logoUrl)}
              alt=""
              className="shop-hero-bar-logo-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="shop-hero-bar-logo-placeholder" aria-hidden>{initial}</span>
          )}
        </div>
        <span className="shop-hero-bar-name">{hero.shopName}</span>
      </div>
      <div className={innerClassName} style={innerStyle}>
        <StaggeredEntrance items={staggerItems} stagger={0.05} />
      </div>
    </header>
  );
}
