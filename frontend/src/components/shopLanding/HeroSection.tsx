import { useTranslation } from '../../i18n/i18n';
import type { HeroConfig } from '../../types/ShopLandingConfig';
import { resolveAssetUrl } from '../../config/api';

interface HeroSectionProps {
  hero: HeroConfig;
  /** When true, hide the in-hero bar (logo/name) when a sticky app header is used */
  hideBar?: boolean;
  /** When set, primary CTA scrolls to this id instead of using hero.cta.url */
  scrollToId?: string;
}

export default function HeroSection({ hero, hideBar = false, scrollToId }: HeroSectionProps) {
  const { t } = useTranslation();
  const primary = hero.primaryColor ?? '#db2777';
  const secondary = hero.secondaryColor ?? '#be185d';
  const isGradient = hero.backgroundStyle !== 'solid';
  const initial = hero.shopName.trim().charAt(0).toUpperCase() || '?';
  const headline = hero.headline ?? t('campaign.headline');
  const ctaLabel = scrollToId ? t('campaign.playNow') : (hero.cta?.label ?? t('campaign.playNow'));

  const handleCtaClick = (e: React.MouseEvent) => {
    if (scrollToId) {
      e.preventDefault();
      document.getElementById(scrollToId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const ctaHref = scrollToId ? `#${scrollToId}` : hero.cta?.url ?? '#';
  const isAnchor = !!scrollToId;

  return (
    <header
      className="shop-hero"
      style={
        {
          '--shop-primary': primary,
          '--shop-secondary': secondary,
        } as React.CSSProperties
      }
    >
      <div className={`shop-hero-bar ${hideBar ? 'shop-hero-bar-hidden' : ''}`}>
        <div className="shop-hero-bar-logo">
          {hero.logoUrl ? (
            <img src={resolveAssetUrl(hero.logoUrl)} alt="" className="shop-hero-bar-logo-img" />
          ) : (
            <span className="shop-hero-bar-logo-placeholder" aria-hidden>{initial}</span>
          )}
        </div>
        <span className="shop-hero-bar-name">{hero.shopName}</span>
      </div>
      <div className={`shop-hero-inner ${isGradient ? 'shop-hero-gradient' : 'shop-hero-solid'}`}>
        <div className="shop-hero-logo-wrap">
          {hero.logoUrl ? (
            <img src={resolveAssetUrl(hero.logoUrl)} alt={hero.shopName} className="shop-hero-logo" />
          ) : (
            <span className="shop-hero-logo-placeholder" aria-hidden>{initial}</span>
          )}
        </div>
        <p className="shop-hero-shop-name">{hero.shopName}</p>
        <h1 className="shop-hero-title">{headline}</h1>
        <p className="shop-hero-tagline">{hero.tagline}</p>
        {isAnchor ? (
          <button
            type="button"
            className="shop-hero-cta shop-hero-cta-button"
            onClick={handleCtaClick}
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </button>
        ) : (
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="shop-hero-cta"
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </header>
  );
}
