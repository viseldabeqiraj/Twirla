import React, { useState, useEffect, useRef } from 'react';
import { ShopConfig, ExperienceMode } from '../types/ShopConfig';
import { useTranslation } from '../i18n/i18n';
import WheelExperience from './experiences/WheelExperience';
import TapHeartsExperience from './experiences/TapHeartsExperience';
import ScratchExperience from './experiences/ScratchExperience';
import CountdownExperience from './experiences/CountdownExperience';
import './ExperienceHost.css';

interface ExperienceHostProps {
  config: ShopConfig;
}

export default function ExperienceHost({ config }: ExperienceHostProps) {
  const { branding, text, cta, mode } = config;
  const { t } = useTranslation();
  const [shouldPulse, setShouldPulse] = useState(false);
  const experienceContentRef = useRef<HTMLDivElement>(null);

  // Get mode-specific title and subtitle
  const getModeTitle = () => {
    if (!mode) return text.title;
    // Convert enum to translation key: "Wheel" -> "wheel", "TapHearts" -> "tapHearts"
    const modeKey = mode.charAt(0).toLowerCase() + mode.slice(1);
    const translated = t(`${modeKey}.title`);
    // If translation exists and is different from the key, use it; otherwise fallback to config
    return translated && translated !== `${modeKey}.title` ? translated : text.title;
  };

  const getModeSubtitle = () => {
    if (!mode) return text.subtitle;
    // Convert enum to translation key: "Wheel" -> "wheel", "TapHearts" -> "tapHearts"
    const modeKey = mode.charAt(0).toLowerCase() + mode.slice(1);
    const translated = t(`${modeKey}.subtitle`);
    // If translation exists and is different from the key, use it; otherwise fallback to config
    return translated && translated !== `${modeKey}.subtitle` ? translated : text.subtitle;
  };

  // Check if result is shown (for CTA pulse animation)
  useEffect(() => {
    const checkForResult = () => {
      if (!experienceContentRef.current) return;
      
      // Check for result elements in the experience content
      const hasResult = experienceContentRef.current.querySelector(
        '.wheel-result, .hearts-reveal, .scratch-reveal, .countdown-ended'
      );
      
      if (hasResult) {
        setShouldPulse(true);
        // Stop pulsing after 10 seconds
        const timer = setTimeout(() => setShouldPulse(false), 10000);
        return () => clearTimeout(timer);
      } else {
        setShouldPulse(false);
      }
    };

    // Check immediately and on any changes
    checkForResult();
    const interval = setInterval(checkForResult, 500);
    
    return () => clearInterval(interval);
  }, [mode]);

  const renderExperience = () => {
    switch (mode) {
      case ExperienceMode.Wheel:
        return config.wheel ? <WheelExperience config={config} /> : null;
      case ExperienceMode.TapHearts:
        return config.tapHearts ? <TapHeartsExperience config={config} /> : null;
      case ExperienceMode.Scratch:
        return config.scratch ? <ScratchExperience config={config} /> : null;
      case ExperienceMode.Countdown:
        return config.countdown ? <CountdownExperience config={config} /> : null;
      default:
        return <div>{t('common.unknownMode')}</div>;
    }
  };

  return (
    <div 
      className="experience-host"
      style={{
        '--primary-color': branding.primaryColor,
        '--secondary-color': branding.secondaryColor,
      } as React.CSSProperties}
    >
      <div className="experience-container">
        {branding.logoUrl && (
          <div className="logo-container">
            <img 
              src={branding.logoUrl} 
              alt={branding.brandName || t('common.logoAlt')} 
              className="logo"
            />
            {branding.brandName && (
              <h2 className="brand-name brand-name-with-logo">{branding.brandName}</h2>
            )}
          </div>
        )}
        
        {branding.brandName && !branding.logoUrl && (
          <h2 className="brand-name">{branding.brandName}</h2>
        )}

        <h1 className="title">{getModeTitle()}</h1>
        {getModeSubtitle() && <p className="subtitle">{getModeSubtitle()}</p>}

        <div className="experience-content" ref={experienceContentRef}>
          {renderExperience()}
        </div>

        <a 
          href={cta.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`cta-button ${shouldPulse ? 'pulse' : ''}`}
        >
          {text.ctaText}
        </a>

        <a 
          href="/" 
          className="twirla-app-button"
        >
          <img 
            src="/logos/twirla.png" 
            alt="Twirla" 
            className="twirla-app-button-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {t('common.goToTwirlaApp')}
        </a>
      </div>
      
      <div className="twirla-footer">
        <img 
          src="/logos/twirla.png" 
          alt="Twirla" 
          className="twirla-logo"
          onError={(e) => {
            // Hide logo if it fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="powered-by">{t('common.poweredBy')}</span>
      </div>
    </div>
  );
}

