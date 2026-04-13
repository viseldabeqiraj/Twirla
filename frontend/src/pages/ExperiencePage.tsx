import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExperienceMode, ShopConfig } from '../types/ShopConfig';
import { fetchShopConfig, fetchShopConfigBySlug } from '../api/configApi';
import { trackEvent } from '../api/analyticsApi';
import { useTranslation } from '../i18n/i18n';
import ExperienceHost from '../components/ExperienceHost';
import ModeNavigation from '../components/ModeNavigation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AppLoader from '../components/twirla-ui/AppLoader';
import { useComputedShopTheme } from '../theme/ShopThemeProvider';
import './ExperiencePage.css';

const DEFAULT_THEME_INPUT = {
  primaryColor: '#db2777',
  secondaryColor: '#be185d',
  backgroundMode: 'light' as const,
};

export default function ExperiencePage() {
  const { shopId, shopName, uniqueId, mode } = useParams<{
    shopId?: string;
    shopName?: string;
    uniqueId?: string;
    mode?: string;
  }>();
  const { language, t } = useTranslation();
  const [config, setConfig] = useState<ShopConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finalShopId = shopId || (shopName && uniqueId ? `${shopName}-${uniqueId}` : null);

    if (!finalShopId) {
      setError(t('experience.shopIdRequired'));
      setLoading(false);
      return;
    }

    if (!mode) {
      setError(t('experience.modeRequired'));
      setLoading(false);
      return;
    }

    const fetchMode = mode?.toLowerCase() === 'runner' ? 'wheel' : mode;
    const normalizeMode = (raw: string) => {
      const m = raw.toLowerCase();
      if (m === 'runner') return 'Runner';
      if (m === 'wheel') return 'Wheel';
      if (m === 'taphearts' || m === 'tap-hearts') return 'TapHearts';
      if (m === 'scratch') return 'Scratch';
      if (m === 'countdown') return 'Countdown';
      if (m === 'memory' || m === 'memorymatch') return 'MemoryMatch';
      return raw;
    };

    const applyConfig = (cfg: ShopConfig) => {
      const finalConfig = { ...cfg, mode: normalizeMode(mode!) as any };
      setConfig(finalConfig);
      setError(null);
      trackEvent(cfg.shopId, 'page_view', { mode: finalConfig.mode });
    };

    fetchShopConfig(finalShopId, fetchMode, language)
      .then(applyConfig)
      .catch(() => {
        if (shopName) {
          return fetchShopConfigBySlug(shopName, fetchMode, language).then(applyConfig);
        }
        throw new Error(t('experience.shopNotFound'));
      })
      .catch((err) => {
        const raw = err instanceof Error ? err.message : t('experience.genericError');
        setError(raw === 'SHOP_DISABLED' ? t('experience.shopDisabled') : raw);
      })
      .finally(() => setLoading(false));
  }, [shopId, shopName, uniqueId, mode, language, t]);

  // Hooks must be called unconditionally — before any early returns
  const themeInput = useMemo(
    () =>
      config
        ? {
            primaryColor: config.branding.primaryColor,
            secondaryColor: config.branding.secondaryColor,
            accentColor: config.branding.accentColor,
            backgroundMode: (config.branding.backgroundMode ??
              (config.branding.theme?.backgroundPattern === 'dark' ? 'dark' : 'light')) as
              | 'light'
              | 'dark',
          }
        : DEFAULT_THEME_INPUT,
    [config],
  );
  const { cssVars } = useComputedShopTheme(themeInput);

  if (loading) {
    return <AppLoader message={t('landing.loading')} variant="full" />;
  }

  if (error || !config) {
    return (
      <div className="experience-error-page">
        <div className="experience-error-card">
          <div className="experience-error-icon" aria-hidden>⚠️</div>
          <h1 className="experience-error-title">Couldn't load this experience</h1>
          <p className="experience-error-message">{error || 'Configuration not found'}</p>
          <p className="experience-error-hint">Check the link or try the demo shop below.</p>
          <div className="experience-error-actions">
            <Link to="/" className="experience-error-btn experience-error-btn-primary">Back to home</Link>
            <Link to="/wheel/demo/allgames01" className="experience-error-btn">Try demo · Wheel</Link>
            <Link to="/taphearts/demo/allgames01" className="experience-error-btn">Try demo · Catch the Prize</Link>
            <Link to="/scratch/demo/allgames01" className="experience-error-btn">Try demo · Scratch</Link>
          </div>
        </div>
      </div>
    );
  }

  const availableModes = [
    ExperienceMode.Runner,
    config.wheel ? ExperienceMode.Wheel : null,
    config.tapHearts ? ExperienceMode.TapHearts : null,
    config.scratch ? ExperienceMode.Scratch : null,
    config.countdown ? ExperienceMode.Countdown : null,
    config.memory ? ExperienceMode.MemoryMatch : null,
  ].filter(Boolean) as ExperienceMode[];

  return (
    <div
      className="experience-page-wrap"
      style={cssVars as React.CSSProperties}
    >
      <ModeNavigation
        currentMode={mode!}
        shopName={shopName!}
        uniqueId={uniqueId!}
        availableModes={availableModes}
        hideGameTabs
      />
      <LanguageSwitcher />
      <ExperienceHost config={config} />
    </div>
  );
}
