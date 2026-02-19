import { useState, useEffect } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { canUserPlay, recordPlay } from '../../utils/playTracking';
import { useTranslation } from '../../i18n/i18n';
import Confetti from '../Confetti';
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
  const { countdown, text, shopId, playCooldownHours = 24 } = config;
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [hasRecordedPlay, setHasRecordedPlay] = useState(false);
  const [wasAlreadyEnded, setWasAlreadyEnded] = useState(false);

  if (!countdown) return null;

  // Check if user can play
  const playStatus = canUserPlay(shopId, playCooldownHours);

  useEffect(() => {
    // Check if countdown already ended before component mounted
    const endDate = new Date(countdown.endAt);
    const now = new Date();
    const initialDiff = endDate.getTime() - now.getTime();
    
    if (initialDiff <= 0) {
      // Countdown already ended - mark as ended but don't record play
      setHasEnded(true);
      setWasAlreadyEnded(true);
      setTimeRemaining(null);
      return;
    }
    
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
  
  // Record play when countdown ends (only if it ended while user was viewing, not if it was already ended)
  useEffect(() => {
    if (hasEnded && !wasAlreadyEnded && playStatus.canPlay && !hasRecordedPlay) {
      // Countdown just ended while user was viewing it
      recordPlay(shopId);
      setHasRecordedPlay(true);
    }
  }, [hasEnded, wasAlreadyEnded, shopId, playStatus.canPlay, hasRecordedPlay]);

  // Show blocked message if user can't play (but still show countdown)
  if (!playStatus.canPlay && !hasEnded) {
    const hoursText = playStatus.hoursRemaining === 1 
      ? t('wheel.hour') 
      : t('wheel.hours');
    return (
      <div className="countdown-message">
        <p>{t('wheel.alreadyPlayed')}</p>
        <p className="cooldown-message">
          {t('wheel.comeBackIn', { 
            hours: playStatus.hoursRemaining?.toString() || '0',
            hoursText 
          })}
        </p>
      </div>
    );
  }

  if (hasEnded || !timeRemaining) {
    return (
      <div className="countdown-ended" style={{ position: 'relative' }}>
        <Confetti />
        <h2 className="end-title" style={{ position: 'relative', zIndex: 1 }}>{text.resultTitle}</h2>
        <p className="end-message" style={{ position: 'relative', zIndex: 1 }}>{countdown.endMessage}</p>
        {text.resultSubtitle && (
          <p className="end-subtitle" style={{ position: 'relative', zIndex: 1 }}>{text.resultSubtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className="countdown-container">
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
          <div className="time-value">{String(timeRemaining.seconds).padStart(2, '0')}</div>
          <div className="time-label">{t('countdown.seconds')}</div>
        </div>
      </div>
      {countdown.showCtaBeforeEnd && (
        <p className="countdown-hint">{t('countdown.dontMissOut')}</p>
      )}
    </div>
  );
}
