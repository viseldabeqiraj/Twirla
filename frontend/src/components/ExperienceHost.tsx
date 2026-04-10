import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShopConfig, ExperienceMode } from '../types/ShopConfig';
import { useTranslation } from '../i18n/i18n';
import { resolveAssetUrl } from '../config/api';
import WheelExperience from './experiences/WheelExperience';
import CatchPrizeExperience from './experiences/CatchPrizeExperience';
import ScratchExperience from './experiences/ScratchExperience';
import CountdownExperience from './experiences/CountdownExperience';
import MemoryMatchExperience from './experiences/MemoryMatchExperience';
import RunnerGame from '../games/runner/RunnerGame';
import AmbientParticles from './AmbientParticles';
import './ExperienceHost.css';

interface ExperienceHostProps {
  config: ShopConfig;
}

export default function ExperienceHost({ config }: ExperienceHostProps) {
  const { branding, text, cta, mode, shopId } = config;
  const { t } = useTranslation();
  const [shouldPulse, setShouldPulse] = useState(false);
  const [showLossFooter, setShowLossFooter] = useState(false);
  const experienceContentRef = useRef<HTMLDivElement>(null);
  const theme = branding.theme || {};

  const getModeTitle = () => {
    if (!mode) return text.title;
    const modeKey = mode.charAt(0).toLowerCase() + mode.slice(1);
    const translated = t(`${modeKey}.title`);
    return translated && translated !== `${modeKey}.title` ? translated : text.title;
  };

  const getModeSubtitle = () => {
    if (!mode) return text.subtitle;
    const modeKey = mode.charAt(0).toLowerCase() + mode.slice(1);
    const translated = t(`${modeKey}.subtitle`);
    return translated && translated !== `${modeKey}.subtitle` ? translated : text.subtitle;
  };

  useEffect(() => {
    let pulseClear: ReturnType<typeof setTimeout> | null = null;
    const tick = () => {
      const root = experienceContentRef.current;
      if (!root) {
        setShouldPulse(false);
        setShowLossFooter(false);
        return;
      }
      const hasResult = root.querySelector(
        '.wheel-result, .hearts-reveal, .scratch-reveal, .countdown-ended, .runner-gameover, .catch-prize-ended, .memory-match-win, .memory-match-lose'
      );
      const isLoss = Boolean(
        root.querySelector(
          '.wheel-result-losing, .memory-match-lose, .catch-prize-ended--nowin, .runner-gameover--nowin'
        )
      );
      setShowLossFooter(isLoss);

      if (hasResult) {
        setShouldPulse(true);
        if (pulseClear) clearTimeout(pulseClear);
        pulseClear = setTimeout(() => setShouldPulse(false), 10000);
      } else {
        setShouldPulse(false);
        if (pulseClear) {
          clearTimeout(pulseClear);
          pulseClear = null;
        }
      }
    };

    tick();
    const interval = setInterval(tick, 400);
    return () => {
      clearInterval(interval);
      if (pulseClear) clearTimeout(pulseClear);
    };
  }, [mode]);

  const renderExperience = () => {
    switch (mode) {
      case ExperienceMode.Runner:
        return (
          <RunnerGame
            config={{
              outcomes: config.runnerGame?.outcomes,
              theme: {
                accent: branding.primaryColor,
                highlight: branding.accentColor ?? branding.secondaryColor,
                ground: branding.secondaryColor,
                obstacleColor: branding.primaryColor,
              },
              ctaLabel: text.ctaText,
              ctaUrl: cta.url,
            }}
          />
        );
      case ExperienceMode.Wheel:
        return config.wheel ? <WheelExperience config={config} /> : null;
      case ExperienceMode.TapHearts:
        return config.tapHearts ? <CatchPrizeExperience config={config} /> : null;
      case ExperienceMode.Scratch:
        return config.scratch ? <ScratchExperience config={config} /> : null;
      case ExperienceMode.Countdown:
        return config.countdown ? <CountdownExperience config={config} /> : null;
      case ExperienceMode.MemoryMatch:
        return config.memory ? <MemoryMatchExperience config={config} /> : null;
      default:
        return <div>{t('common.unknownMode')}</div>;
    }
  };

  return (
    <div
      className={`experience-host pattern-${theme.backgroundPattern || 'gradient'} surface-${theme.surfaceStyle || 'glass'} ambient-${theme.ambientMotion ?? 'none'}`}
      style={{
        '--primary-color': branding.primaryColor,
        '--secondary-color': branding.secondaryColor,
        '--accent-color': branding.accentColor || branding.primaryColor,
        '--app-font': theme.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        '--card-radius': `${theme.borderRadius ?? 26}px`,
        '--btn-radius': `${theme.buttonRadius ?? 14}px`,
      } as React.CSSProperties}
    >
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      {theme.ambientParticles?.enabled ? (
        <AmbientParticles
          shopId={shopId}
          particles={theme.ambientParticles}
          primaryColor={branding.primaryColor}
          secondaryColor={branding.secondaryColor}
          accentColor={branding.accentColor || branding.primaryColor}
        />
      ) : null}
      <motion.div className="experience-container" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {(branding.logoUrl || branding.brandName) && (
          <div className="brand-head">
            {branding.logoUrl && <img src={resolveAssetUrl(branding.logoUrl)} alt={branding.brandName || t('common.logoAlt')} className="logo" />}
            {branding.brandName && <h2 className="brand-name">{branding.brandName}</h2>}
          </div>
        )}

        <h1 className="title">{getModeTitle()}</h1>
        {getModeSubtitle() && <p className="subtitle">{getModeSubtitle()}</p>}

        <div className="experience-content" ref={experienceContentRef}>{renderExperience()}</div>

        {showLossFooter ? (
          <p className="experience-loss-footer" role="status">
            {t('campaign.noPrizeFooter')}
          </p>
        ) : (
          <motion.a
            href={cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`cta-button ${shouldPulse ? 'pulse' : ''}`}
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
          >
            {shouldPulse ? t('campaign.dmToClaim') : text.ctaText}
          </motion.a>
        )}

        <a href="/" className="twirla-app-button">
          <img src={resolveAssetUrl('/logos/twirla.png')} alt="Twirla" className="twirla-app-button-logo" />
          {t('common.goToTwirlaApp')}
        </a>
      </motion.div>
    </div>
  );
}
