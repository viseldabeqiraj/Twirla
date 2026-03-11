import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ShopLandingConfig } from '../types/ShopLandingConfig';
import { getShopLandingConfig } from '../data/shopLandingPlaceholder';
import { fetchShopConfigBySlug } from '../api/configApi';
import { shopConfigToLandingConfig } from '../data/shopConfigToLanding';
import ModeNavigation from '../components/ModeNavigation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  HeroSection,
  SocialButtons,
  FeaturedProducts,
  GamesSection,
  FooterSection,
} from '../components/shopLanding';
import './ShopLandingPage.css';

export default function ShopLandingPage() {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const [config, setConfig] = useState<ShopLandingConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopSlug) {
      setError('Missing shop');
      return;
    }
    fetchShopConfigBySlug(shopSlug)
      .then((apiConfig) => setConfig(shopConfigToLandingConfig(apiConfig, shopSlug)))
      .catch(() => getShopLandingConfig(shopSlug).then(setConfig))
      .catch((err) => setError(err?.message ?? 'Failed to load shop'));
  }, [shopSlug]);

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
        <p>Loading…</p>
      </div>
    );
  }

  const primary = config.primaryColor ?? config.hero.primaryColor ?? '#db2777';
  const secondary = config.secondaryColor ?? config.hero.secondaryColor ?? '#be185d';
  const uniqueId = config.experiencePath?.uniqueId ?? 'main';

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
      <ModeNavigation
        shopName={config.shopSlug}
        uniqueId={uniqueId}
        availableModes={config.enabledGames}
        isShopLanding
      />
      <LanguageSwitcher />
      <HeroSection hero={config.hero} />
      <SocialButtons social={config.social} />
      <FeaturedProducts products={config.featuredProducts} />
      <GamesSection
        enabledGames={config.enabledGames}
        experiencePath={config.experiencePath}
      />
      <FooterSection footer={config.footer} shopSlug={config.shopSlug} />
    </div>
  );
}
