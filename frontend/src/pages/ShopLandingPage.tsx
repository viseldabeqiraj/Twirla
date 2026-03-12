import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ShopLandingConfig } from '../types/ShopLandingConfig';
import { getShopLandingConfig } from '../data/shopLandingPlaceholder';
import { fetchShopConfigBySlug } from '../api/configApi';
import { shopConfigToLandingConfig } from '../data/shopConfigToLanding';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  HeroSection,
  AboutSection,
  SocialButtons,
  FeaturedProducts,
  GamesSection,
  HowItWorksSection,
  TestimonialsSection,
  TrustBadgesSection,
  FAQSection,
} from '../components/shopLanding';
import { resolveAssetUrl } from '../config/api';
import { useTranslation } from '../i18n/i18n';
import './ShopLandingPage.css';

export default function ShopLandingPage() {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const { t } = useTranslation();
  const [config, setConfig] = useState<ShopLandingConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopSlug) {
      setError(t('landing.errorMissingShop'));
      return;
    }
    fetchShopConfigBySlug(shopSlug)
      .then((apiConfig) => setConfig(shopConfigToLandingConfig(apiConfig, shopSlug)))
      .catch(() => getShopLandingConfig(shopSlug).then(setConfig))
      .catch((err) => setError(err?.message ?? t('landing.errorLoadFailed')));
  }, [shopSlug, t]);

  if (error) {
    return (
      <div className="shop-landing shop-landing-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="shop-landing shop-landing-loading">
        <p>{t('landing.loading')}</p>
      </div>
    );
  }

  const primary = config.primaryColor ?? config.hero.primaryColor ?? '#db2777';
  const secondary = config.secondaryColor ?? config.hero.secondaryColor ?? '#be185d';
  const hero = config.hero;
  const initial = hero.shopName.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      className="shop-landing"
      style={
        {
          '--shop-primary': primary,
          '--shop-secondary': secondary,
          '--primary-color': primary,
          '--secondary-color': secondary,
        } as React.CSSProperties
      }
    >
      <header className="shop-landing-app-header">
        <div className="shop-landing-app-header-inner">
          <div className="shop-landing-app-logo">
            {hero.logoUrl ? (
              <img src={resolveAssetUrl(hero.logoUrl)} alt="" />
            ) : (
              <span className="shop-landing-app-logo-placeholder" aria-hidden>{initial}</span>
            )}
          </div>
          <span className="shop-landing-app-name">{hero.shopName}</span>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="shop-landing-main">
        <HeroSection hero={config.hero} hideBar scrollToId="featured-game" />
        <HowItWorksSection />
        <GamesSection
          enabledGames={config.enabledGames}
          featuredGame={config.featuredGame}
          experiencePath={config.experiencePath}
          sectionTitle={config.gamesSectionTitle}
        />
        <AboutSection about={config.about} />
        <SocialButtons social={config.social} />
        <FeaturedProducts
          products={config.featuredProducts}
          sectionTitle={config.featuredSectionTitle}
        />
        {(config.testimonials?.length ?? 0) > 0 && (
          <TestimonialsSection testimonials={config.testimonials!} />
        )}
        {(config.trustBadges?.length ?? 0) > 0 && (
          <TrustBadgesSection trustBadges={config.trustBadges!} />
        )}
        {(config.faq?.length ?? 0) > 0 && <FAQSection faq={config.faq!} />}
      </main>
    </div>
  );
}
