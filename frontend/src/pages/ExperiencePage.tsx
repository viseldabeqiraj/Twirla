import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopConfig } from '../types/ShopConfig';
import { fetchShopConfig } from '../api/configApi';
import { useTranslation } from '../i18n/i18n';
import ExperienceHost from '../components/ExperienceHost';
import ModeNavigation from '../components/ModeNavigation';
import LanguageSwitcher from '../components/LanguageSwitcher';

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

    console.log('Fetching config for shopId:', finalShopId, 'mode:', mode, 'language:', language);
    fetchShopConfig(finalShopId, mode, language)
      .then((config) => {
        console.log('Config loaded:', config);
        const normalizeMode = (raw: string) => {
          const m = raw.toLowerCase();
          if (m === 'wheel') return 'Wheel';
          if (m === 'taphearts' || m === 'tap-hearts') return 'TapHearts';
          if (m === 'scratch') return 'Scratch';
          if (m === 'countdown') return 'Countdown';
          return raw;
        };

        setConfig({ ...config, mode: normalizeMode(mode) as any });
      })
      .catch((err) => {
        console.error('Error fetching config:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [shopId, shopName, uniqueId, mode, language]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>Error</h1>
          <p>{error || 'Configuration not found'}</p>
        </div>
      </div>
    );
  }

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
      />
      <LanguageSwitcher />
      <ExperienceHost config={config} />
    </div>
  );
}

