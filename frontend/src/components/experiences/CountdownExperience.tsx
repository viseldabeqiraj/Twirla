import { useState, useEffect, useRef } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { useShopExperience } from '../../context/ShopExperienceContext';
import { trackEvent } from '../../api/analyticsApi';
import { useTranslation } from '../../i18n/i18n';
import RewardCelebration from '../RewardCelebration';
import './CountdownExperience.css';

interface CountdownExperienceProps {
  config: ShopConfig;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownExperience({ config }: CountdownExperienceProps) {
  const { countdown, text, shopId } = config;
  const { t } = useTranslation();
  const { markPlayed } = useShopExperience();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [hasRecordedPlay, setHasRecordedPlay] = useState(false);
  const [wasAlreadyEnded, setWasAlreadyEnded] = useState(false);
  const [initialDurationMs, setInitialDurationMs] = useState<number | null>(null);
  const [energy, setEnergy] = useState(0);
  const hasTrackedStart = useRef(false);
  const hasTrackedFinish = useRef(false);

  if (!countdown) return null;

  useEffect(() => {
    const endDate = new Date(countdown.endAt);
    if (endDate.getTime() <= Date.now()) return; // Already ended, don't track start
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackEvent(shopId, 'game_start', { mode: 'Countdown' });
    }
  }, [shopId, countdown.endAt]);

  useEffect(() => {
    // Check if countdown already ended before component mounted
    const endDate = new Date(countdown.endAt);
    const now = new Date();
    const initialDiff = endDate.getTime() - now.getTime();
    
    if (initialDiff <= 0) {
      setHasEnded(true);
      setWasAlreadyEnded(true);
      setTimeRemaining(null);
      return;
    }

    setInitialDurationMs(initialDiff);
    
    const calculateTimeRemaining = (): TimeRemaining | null => {
      const endDate = new Date(countdown.endAt);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        // Countdown just ended while user is viewing
        setHasEnded(true);
        return null;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Calculate immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown.endAt]);
  
  // Record play and analytics when countdown ends (only if it ended while user was viewing)
  useEffect(() => {
    if (hasEnded && !wasAlreadyEnded && !hasRecordedPlay) {
      if (!hasTrackedFinish.current) {
        hasTrackedFinish.current = true;
        trackEvent(shopId, 'game_finish', { mode: 'Countdown' });
        trackEvent(shopId, 'reward_won', { mode: 'Countdown' });
      }
      markPlayed();
      setHasRecordedPlay(true);
    }
  }, [hasEnded, wasAlreadyEnded, shopId, hasRecordedPlay, markPlayed]);

  if (hasEnded || !timeRemaining) {
    return (
      <RewardCelebration className="countdown-ended" confettiCount={50}>
        <h2 className="end-title">{text.resultTitle}</h2>
        <p className="end-message">{countdown.endMessage}</p>
        {text.resultSubtitle && <p className="end-subtitle">{text.resultSubtitle}</p>}
      </RewardCelebration>
    );
  }

  const remainingMs = timeRemaining
    ? (((timeRemaining.days * 24 + timeRemaining.hours) * 60 + timeRemaining.minutes) * 60 + timeRemaining.seconds) * 1000
    : 0;
  const progress = initialDurationMs ? Math.max(0, Math.min(100, ((initialDurationMs - remainingMs) / initialDurationMs) * 100)) : 0;
  const isFinalSeconds = timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds <= 10;

  return (
    <div className="countdown-container">
      <div className="countdown-progress-track">
        <div className="countdown-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="countdown-timer">
        <div className="time-unit">
          <div className="time-value">{timeRemaining.days}</div>
          <div className="time-label">{t('countdown.days')}</div>
        </div>
        <div className="time-separator">:</div>
        <div className="time-unit">
          <div className="time-value">{String(timeRemaining.hours).padStart(2, '0')}</div>
          <div className="time-label">{t('countdown.hours')}</div>
        </div>
        <div className="time-separator">:</div>
        <div className="time-unit">
          <div className="time-value">{String(timeRemaining.minutes).padStart(2, '0')}</div>
          <div className="time-label">{t('countdown.minutes')}</div>
        </div>
        <div className="time-separator">:</div>
        <div className="time-unit">
          <div className={`time-value ${isFinalSeconds ? 'urgent' : ''}`}>{String(timeRemaining.seconds).padStart(2, '0')}</div>
          <div className="time-label">{t('countdown.seconds')}</div>
        </div>
      </div>
      <div className="energy-row">
        <button className="energy-button" onClick={() => setEnergy((e) => Math.min(100, e + 12))}>Charge hype ⚡</button>
        <div className="energy-track"><div className="energy-fill" style={{ width: `${energy}%` }} /></div>
      </div>
      {countdown.showCtaBeforeEnd && (
        <p className="countdown-hint">{t('countdown.dontMissOut')} {energy >= 100 ? ' · Hype maxed!' : ''}</p>
      )}
    </div>
  );
}
