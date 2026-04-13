import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShopConfig, ExperienceMode } from '../types/ShopConfig';
import { useTranslation } from '../i18n/i18n';
import { resolveAssetUrl } from '../config/api';
import { trackEvent } from '../api/analyticsApi';
import WheelExperience from './experiences/WheelExperience';
import CatchPrizeExperience from './experiences/CatchPrizeExperience';
import ScratchExperience from './experiences/ScratchExperience';
import CountdownExperience from './experiences/CountdownExperience';
import MemoryMatchExperience from './experiences/MemoryMatchExperience';
import RunnerGame from '../games/runner/RunnerGame';
import AmbientParticles from './AmbientParticles';
import AnimatedPrimaryButton from './twirla-ui/AnimatedPrimaryButton';
import { HideRewardModalShopCtaContext } from './ExperienceRewardCtaContext';
import { ShopThemeProvider, useComputedShopTheme } from '../theme/ShopThemeProvider';
import './ExperienceHost.css';

interface ExperienceHostProps {
  config: ShopConfig;
}

export default function ExperienceHost({ config }: ExperienceHostProps) {
  const { branding, text, cta, mode, shopId } = config;
  const { t } = useTranslation();
  const [shouldPulse, setShouldPulse] = useState(false);
  const experienceContentRef = useRef<HTMLDivElement>(null);
  const theme = branding.theme || {};

  const bgMode = branding.backgroundMode ?? (theme.backgroundPattern === 'dark' ? 'dark' : 'light');
  const themeInput = useMemo(
    () => ({
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor: branding.accentColor,
      backgroundMode: bgMode as 'light' | 'dark',
      logoBackgroundColor: branding.logoBackgroundColor,
    }),
    [branding.primaryColor, branding.secondaryColor, branding.accentColor, bgMode, branding.logoBackgroundColor],
  );
  const { cssVars } = useComputedShopTheme(themeInput);

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
        return;
      }
      const hasResult = root.querySelector(
        '.wheel-result, .scratch-reveal, .countdown-ended, .runner-gameover, .catch-prize-ended, .memory-match-win, .memory-match-lose, .scratch-reward-panel'
      );
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
            shopId={shopId}
            shopSlug={config.slug ?? shopId}
            experienceMode="Runner"
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

  const hostStyle = {
    ...cssVars,
    '--app-font': theme.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    '--card-radius': `${theme.borderRadius ?? 26}px`,
    '--btn-radius': `${theme.buttonRadius ?? 14}px`,
  } as React.CSSProperties;

  return (
    <ShopThemeProvider input={themeInput}>
    <div
      className={`experience-host pattern-${theme.backgroundPattern || 'gradient'} surface-${theme.surfaceStyle || 'glass'} ambient-${theme.ambientMotion ?? 'none'}`}
      style={hostStyle}
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
      <HideRewardModalShopCtaContext.Provider value={true}>
      <motion.div className="experience-container" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {branding.logoUrl ? (
          <div className="brand-head">
            <img src={resolveAssetUrl(branding.logoUrl)} alt={branding.brandName || t('common.logoAlt')} className="logo" />
          </div>
        ) : null}

        <h1 className="title">{getModeTitle()}</h1>
        {getModeSubtitle() && <p className="subtitle">{getModeSubtitle()}</p>}
        {text.maxDiscountPercent != null && text.maxDiscountPercent > 0 ? (
          <p className="experience-preplay">{t('games.prePlayDiscount', { pct: String(text.maxDiscountPercent) })}</p>
        ) : null}

        <div className="experience-content" ref={experienceContentRef}>{renderExperience()}</div>

        <AnimatedPrimaryButton
          href={cta.url}
          external
          block
          pulse={shouldPulse}
          className="cta-button"
          onClick={() => trackEvent(shopId, 'cta_clicked', { mode: String(mode ?? '') })}
        >
          {shouldPulse ? t('campaign.dmToClaim') : text.ctaText}
        </AnimatedPrimaryButton>

        <a href="/" className="twirla-app-button">
          <img src={resolveAssetUrl('/logos/twirla.png')} alt="Twirla" className="twirla-app-button-logo" />
          {t('common.goToTwirlaApp')}
        </a>
      </motion.div>
      </HideRewardModalShopCtaContext.Provider>
    </div>
    </ShopThemeProvider>
  );
}
