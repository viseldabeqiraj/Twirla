import { Fragment, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import type { ShopLandingConfig } from '../types/ShopLandingConfig';
import { getShopLandingConfig } from '../data/shopLandingPlaceholder';
import {
  LANDING_MAIN_SECTION_ORDER,
  type LandingMainSectionKey,
} from '../data/landingSectionOrder';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  HeroSection,
  ValuePropositionSection,
  AboutSection,
  FeaturedProducts,
  GamesSection,
  HowItWorksSection,
  HowToOrderSection,
  ContactSection,
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
    let cancelled = false;
    getShopLandingConfig(shopSlug)
      .then((cfg) => {
        if (!cancelled) setConfig(cfg);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err?.message === 'SHOP_DISABLED'
              ? t('landing.shopDisabled')
              : err?.message ?? t('landing.errorLoadFailed');
          setError(msg);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [shopSlug, t]);

  const primary = config?.primaryColor ?? config?.hero.primaryColor ?? '#db2777';
  const secondary = config?.secondaryColor ?? config?.hero.secondaryColor ?? '#be185d';
  const accent = config?.accentColor ?? secondary;
  const fontPair = config?.fontPairId ?? 'default';
  const layout = config?.layoutTemplate ?? 'product-focused';

  const mainSections = useMemo(() => {
    if (!config) return null;
    const valueProp = config.valueProposition;
    const showValueProp = Boolean(valueProp?.headline?.trim() || valueProp?.body?.trim());
    const howToOrder = config.howToOrder;
    const showHowToOrder = Boolean(howToOrder?.body?.trim());

    const blocks: Record<LandingMainSectionKey, ReactNode> = {
      value: showValueProp && valueProp ? <ValuePropositionSection value={valueProp} /> : null,
      products: (
        <FeaturedProducts
          products={config.featuredProducts}
          sectionTitle={config.featuredSectionTitle}
          social={config.social}
        />
      ),
      howItWorks: <HowItWorksSection />,
      games: (
        <GamesSection
          enabledGames={config.enabledGames}
          featuredGame={config.featuredGame}
          experiencePath={config.experiencePath}
          sectionTitle={config.gamesSectionTitle}
        />
      ),
      howToOrder: showHowToOrder && howToOrder ? <HowToOrderSection howToOrder={howToOrder} /> : null,
      about: <AboutSection about={config.about} />,
      contact: <ContactSection social={config.social} about={config.about} />,
      testimonials:
        (config.testimonials?.length ?? 0) > 0 ? (
          <TestimonialsSection testimonials={config.testimonials!} />
        ) : null,
      trust:
        (config.trustBadges?.length ?? 0) > 0 ? (
          <TrustBadgesSection trustBadges={config.trustBadges!} />
        ) : null,
      faq: (config.faq?.length ?? 0) > 0 ? <FAQSection faq={config.faq!} /> : null,
    };

    const order = LANDING_MAIN_SECTION_ORDER[layout] ?? LANDING_MAIN_SECTION_ORDER['product-focused'];
    return order.map((key) => {
      const node = blocks[key];
      if (!node) return null;
      return <Fragment key={key}>{node}</Fragment>;
    });
  }, [config, layout]);

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

  const hero = config.hero;
  const initial = hero.shopName.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      className="shop-landing"
      data-layout={layout}
      data-font-pair={fontPair}
      style={
        {
          '--shop-primary': primary,
          '--shop-secondary': secondary,
          '--shop-accent': accent,
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
        {mainSections}
      </main>
    </div>
  );
}
