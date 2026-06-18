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
import AppLoader from '../components/twirla-ui/AppLoader';
import AnimatedBackground from '../components/twirla-ui/AnimatedBackground';
import ParticlesBackground from '../components/twirla-ui/ParticlesBackground';
import { ShopThemeProvider, useComputedShopTheme } from '../theme/ShopThemeProvider';
import './ShopLandingPage.css';

export default function ShopLandingPage() {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const { language, t } = useTranslation();
  const [config, setConfig] = useState<ShopLandingConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopSlug) {
      setError(t('landing.errorMissingShop'));
      return;
    }
    let cancelled = false;
    getShopLandingConfig(shopSlug, language)
      .then((cfg) => {
        if (!cancelled) setConfig(cfg);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err?.message === 'SHOP_DISABLED'
              ? t('landing.shopDisabled')
              : err?.message === 'SHOP_EXPIRED'
                ? t('landing.shopExpired')
                : err?.message ?? t('landing.errorLoadFailed');
          setError(msg);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [shopSlug, language, t]);

  const primary = config?.primaryColor ?? config?.hero.primaryColor ?? '#db2777';
  const secondary = config?.secondaryColor ?? config?.hero.secondaryColor ?? '#be185d';
  const accent = config?.accentColor ?? secondary;
  const bgMode = config?.backgroundMode ?? 'light';
  const fontPair = config?.fontPairId ?? 'default';
  const layout = config?.layoutTemplate ?? 'product-focused';

  const hasFullSpotPalette = Boolean(
    config?.spotPalette?.deep &&
      config?.spotPalette?.muted &&
      config?.spotPalette?.wash &&
      config?.spotPalette?.accent,
  );

  const themeInput = useMemo(
    () => ({
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      backgroundMode: bgMode as 'light' | 'dark',
      logoBackgroundColor: config?.logoBackgroundColor,
      spotPalette: hasFullSpotPalette ? config!.spotPalette : undefined,
    }),
    [
      primary,
      secondary,
      accent,
      bgMode,
      config?.logoBackgroundColor,
      hasFullSpotPalette,
      config?.spotPalette,
    ],
  );
  const { tokens, cssVars } = useComputedShopTheme(themeInput);

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
    return <AppLoader message={t('landing.loading')} variant="full" />;
  }

  const hero = config.hero;
  const initial = hero.shopName.trim().charAt(0).toUpperCase() || '?';

  return (
    <ShopThemeProvider input={themeInput}>
      <div
        className={`shop-landing ${bgMode === 'dark' ? 'shop-landing--dark' : ''}`}
        data-layout={layout}
        data-font-pair={fontPair}
        data-bg-mode={bgMode}
        data-spot-palette={hasFullSpotPalette ? '1' : undefined}
        style={cssVars as React.CSSProperties}
      >
        <header className="shop-landing-app-header">
          <div className="shop-landing-app-header-inner">
            <div
              className={`shop-landing-app-logo${hero.logoUrl ? ' shop-landing-app-logo--image' : ''}`}
              style={hero.logoUrl ? undefined : { background: tokens.logoBackground }}
            >
              {hero.logoUrl ? (
                <img src={resolveAssetUrl(hero.logoUrl)} alt={hero.shopName} referrerPolicy="no-referrer" />
              ) : (
                <span className="shop-landing-app-logo-placeholder" aria-hidden>{initial}</span>
              )}
            </div>
            {!hero.logoUrl ? <span className="shop-landing-app-name">{hero.shopName}</span> : null}
            <LanguageSwitcher />
          </div>
        </header>

        <main className="shop-landing-main">
          <div className="shop-landing-main__decor" aria-hidden>
            <AnimatedBackground primaryColor={primary} secondaryColor={secondary} />
            {config.particlesBackground?.enabled ? (
              <ParticlesBackground
                shopSlug={config.shopSlug}
                primaryColor={primary}
                secondaryColor={secondary}
                accentColor={accent}
                backgroundMode={bgMode}
                config={config.particlesBackground}
              />
            ) : null}
          </div>
          <HeroSection hero={config.hero} hideBar scrollToId="featured-game" />
          {mainSections}
        </main>
      </div>
    </ShopThemeProvider>
  );
}
