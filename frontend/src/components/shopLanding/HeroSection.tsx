import type { HeroConfig } from '../../types/ShopLandingConfig';

interface HeroSectionProps {
  hero: HeroConfig;
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const primary = hero.primaryColor ?? '#db2777';
  const secondary = hero.secondaryColor ?? '#be185d';
  const isGradient = hero.backgroundStyle !== 'solid';
  const initial = hero.shopName.trim().charAt(0).toUpperCase() || '?';

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
      <div className="shop-hero-bar">
        <div className="shop-hero-bar-logo">
          {hero.logoUrl ? (
            <img src={hero.logoUrl} alt="" className="shop-hero-bar-logo-img" />
          ) : (
            <span className="shop-hero-bar-logo-placeholder" aria-hidden>{initial}</span>
          )}
        </div>
        <span className="shop-hero-bar-name">{hero.shopName}</span>
      </div>
      <div className={`shop-hero-inner ${isGradient ? 'shop-hero-gradient' : 'shop-hero-solid'}`}>
        <div className="shop-hero-logo-wrap">
          {hero.logoUrl ? (
            <img src={hero.logoUrl} alt={hero.shopName} className="shop-hero-logo" />
          ) : (
            <span className="shop-hero-logo-placeholder" aria-hidden>{initial}</span>
          )}
        </div>
        <h1 className="shop-hero-title">{hero.shopName}</h1>
        <p className="shop-hero-tagline">{hero.tagline}</p>
        <a
          href={hero.cta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shop-hero-cta"
        >
          {hero.cta.label}
        </a>
      </div>
    </header>
  );
}
