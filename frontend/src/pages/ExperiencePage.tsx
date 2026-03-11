import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExperienceMode, ShopConfig } from '../types/ShopConfig';
import { fetchShopConfig, fetchShopConfigBySlug } from '../api/configApi';
import { trackEvent } from '../api/analyticsApi';
import { useTranslation } from '../i18n/i18n';
import ExperienceHost from '../components/ExperienceHost';
import ModeNavigation from '../components/ModeNavigation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import CuteLoader from '../components/CuteLoader';
import './ExperiencePage.css';

export default function ExperiencePage() {
  const { shopId, shopName, uniqueId, mode } = useParams<{ 
    shopId?: string; 
    shopName?: string; 
    uniqueId?: string; 
    mode?: string 
  }>();
  const { language } = useTranslation();
  const [config, setConfig] = useState<ShopConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Format: /mode/shopName/uniqueId
    const finalShopId = shopId || (shopName && uniqueId ? `${shopName}-${uniqueId}` : null);
    
    if (!finalShopId) {
      setError('Shop ID is required');
      setLoading(false);
      return;
    }

    if (!mode) {
      setError('Mode is required');
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
      return raw;
    };

    const applyConfig = (config: ShopConfig) => {
      const finalConfig = { ...config, mode: normalizeMode(mode!) as any };
      setConfig(finalConfig);
      setError(null);
      trackEvent(config.shopId, 'page_view', { mode: finalConfig.mode });
    };

    fetchShopConfig(finalShopId, fetchMode, language)
      .then(applyConfig)
      .catch(() => {
        if (shopName) {
          return fetchShopConfigBySlug(shopName, fetchMode, language).then(applyConfig);
        }
        throw new Error('Shop not found');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      })
      .finally(() => setLoading(false));
  }, [shopId, shopName, uniqueId, mode, language]);

  if (loading) {
    return <CuteLoader />;
  }

  if (error || !config) {
    return (
      <div className="experience-error-page">
        <div className="experience-error-card">
          <div className="experience-error-icon" aria-hidden>⚠️</div>
          <h1 className="experience-error-title">Couldn’t load this experience</h1>
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
  ].filter(Boolean) as ExperienceMode[];

  return (
    <div 
      style={{
        '--primary-color': config.branding.primaryColor,
        '--secondary-color': config.branding.secondaryColor,
      } as React.CSSProperties}
    >
      <ModeNavigation 
        currentMode={mode!} 
        shopName={shopName!} 
        uniqueId={uniqueId!}
        availableModes={availableModes}
      />
      <LanguageSwitcher />
      <ExperienceHost config={config} />
    </div>
  );
}

