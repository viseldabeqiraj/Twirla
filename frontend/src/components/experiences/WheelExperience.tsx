import React, { useState, useRef } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { recordPlay } from '../../utils/playTracking';
import { trackEvent } from '../../api/analyticsApi';
import { useTranslation } from '../../i18n/i18n';
import Confetti from '../Confetti';
import './WheelExperience.css';

interface WheelExperienceProps {
  config: ShopConfig;
}

export default function WheelExperience({ config }: WheelExperienceProps) {
  const { wheel, text, shopId } = config;
  const { t } = useTranslation();
  const [hasSpun, setHasSpun] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null);
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [showBlockedTooltip, setShowBlockedTooltip] = useState(false);
  const [buttonShake, setButtonShake] = useState(false);
  const [skillValue, setSkillValue] = useState(0);
  const [skillDirection, setSkillDirection] = useState(1);
  const [skillLocked, setSkillLocked] = useState(false);
  const [skillLabel, setSkillLabel] = useState('Warm-up');
  const hasTrackedFinish = useRef(false);

  if (!wheel) return null;

  // TEMP (testing): daily cooldown disabled.
  // const playStatus = canUserPlay(shopId, playCooldownHours);
  const playStatus = { canPlay: true, hoursRemaining: null as number | null };

  React.useEffect(() => {
    if (skillLocked) return;
    const timer = setInterval(() => {
      setSkillValue((prev) => {
        let next = prev + 6 * skillDirection;
        if (next >= 100) {
          setSkillDirection(-1);
          next = 100;
        }
        if (next <= 0) {
          setSkillDirection(1);
          next = 0;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(timer);
  }, [skillDirection, skillLocked]);

  const selectPrize = (): { label: string; index: number } => {
    const totalWeight = wheel.prizes.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < wheel.prizes.length; i++) {
      const prize = wheel.prizes[i];
      random -= prize.weight;
      if (random <= 0) {
        return { label: prize.label, index: i };
      }
    }
    
    return { label: wheel.prizes[0].label, index: 0 };
  };

  // Determine if a prize is winning or losing
  const isWinningPrize = (prizeLabel: string): boolean => {
    const prize = wheel.prizes.find(p => p.label === prizeLabel);
    if (!prize) return true; // Default to winning if prize not found
    
    // If explicitly set, use that value
    if (prize.isWinning !== undefined && prize.isWinning !== null) {
      return prize.isWinning;
    }
    
    // Auto-detect: only mark as losing if label EXACTLY matches losing patterns
    // This prevents false positives (e.g., "20% Off" should never match "off" in "no prize")
    const losingPatterns = [
      'try again',
      'better luck',
      'no prize',
      'nothing',
      'unlucky',
      'sorry',
      'no win',
      'not this time'
    ];
    const labelLower = prizeLabel.toLowerCase().trim();
    
    // Only match if label is exactly a losing pattern (case-insensitive)
    // This is very strict to avoid false positives
    const isLosing = losingPatterns.includes(labelLower);
    
    // Default to winning (most prizes like discounts, free shipping, etc. are winning)
    return !isLosing;
  };

  const lockSkill = () => {
    if (skillLocked) return;
    setSkillLocked(true);
    if (skillValue >= 45 && skillValue <= 55) setSkillLabel('Perfect timing ✨');
    else if (skillValue >= 35 && skillValue <= 65) setSkillLabel('Nice timing 👍');
    else setSkillLabel('Wild spin 😅');
  };

  const resetRound = () => {
    setShowResult(false);
    setSelectedPrize(null);
    setSelectedPrizeIndex(null);
    setWheelRotation(0);
    setSkillLocked(false);
    setSkillLabel('Warm-up');
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (!skillLocked) {
      setShowBlockedTooltip(true);
      setTimeout(() => setShowBlockedTooltip(false), 1800);
      return;
    }
    
    // Check if user can play (cooldown check)
    if (!playStatus.canPlay) {
      setButtonShake(true);
      setShowBlockedTooltip(true);
      setTimeout(() => setButtonShake(false), 500);
      setTimeout(() => setShowBlockedTooltip(false), 3000);
      return;
    }
    
    // Check if already spun and repeat not allowed
    if (hasSpun && !wheel.allowRepeatSpins) {
      setButtonShake(true);
      setShowBlockedTooltip(true);
      setTimeout(() => setButtonShake(false), 500);
      setTimeout(() => setShowBlockedTooltip(false), 3000);
      return;
    }

    setIsSpinning(true);
    setShowResult(false);
    setSelectedPrize(null);
    setSelectedPrizeIndex(null);
    setWheelRotation(0); // Reset to 0 for new spin
    setShowBlockedTooltip(false);
    hasTrackedFinish.current = false;
    trackEvent(shopId, 'game_start', { mode: 'Wheel' });

    const { label, index } = selectPrize();
    setSelectedPrizeIndex(index); // Set immediately so wheel knows where to stop
    
    // Calculate final rotation
    const sliceAngle = 360 / wheel.prizes.length;
    const sliceCenterAngle = index * sliceAngle + sliceAngle / 2;
    const rotation = 360 - sliceCenterAngle;
    const finalRotation = 1080 + rotation;
    
    // Start spin animation - transition from 0 to final rotation
    requestAnimationFrame(() => {
      setWheelRotation(finalRotation);
    });
    
    // Spin animation duration
    setTimeout(() => {
      setIsSpinning(false);
      // Wait 2 seconds after wheel stops before showing result
      setTimeout(() => {
        setSelectedPrize(label);
        setShowResult(true);
        setHasSpun(true);
        if (!hasTrackedFinish.current) {
          hasTrackedFinish.current = true;
          trackEvent(shopId, 'game_finish', { mode: 'Wheel' });
          if (isWinningPrize(label)) trackEvent(shopId, 'reward_won', { mode: 'Wheel' });
        }
        recordPlay(shopId);
      }, 2000);
    }, 2000);
  };

  if (showResult && selectedPrize) {
    const isWinning = isWinningPrize(selectedPrize);
    const prize = wheel.prizes.find(p => p.label === selectedPrize);
    
    if (!isWinning) {
      // Losing result - show sad animation
      return (
        <div className="wheel-result wheel-result-losing">
          <div className="sad-emoji">😔</div>
          <h2 className="result-title losing-title">{t('wheel.noWinTitle')}</h2>
          <p className="result-subtitle">{t('wheel.noWinMessage')}</p>
          <div className="prize-display losing-prize">
            <div className="prize-label">{selectedPrize}</div>
            {prize?.description && (
              <p className="prize-description">{prize.description}</p>
            )}
          </div>
          <button className="play-again-button" onClick={resetRound}>Play again</button>
        </div>
      );
    }
    
    // Winning result - show celebration
    return (
      <div className="wheel-result wheel-result-winning">
        <Confetti />
        <h2 className="result-title">{text.resultTitle}</h2>
        {text.resultSubtitle && <p className="result-subtitle">{text.resultSubtitle}</p>}
        <div className="prize-display">
          <div className="prize-label">{selectedPrize}</div>
          {prize?.description && (
            <p className="prize-description">{prize.description}</p>
          )}
        </div>
        <button className="play-again-button" onClick={resetRound}>Spin again</button>
      </div>
    );
  }

  // Show blocked message if user can't play
  if (!playStatus.canPlay) {
    const hoursText = playStatus.hoursRemaining === 1 
      ? t('wheel.hour') 
      : t('wheel.hours');
    return (
      <div className="wheel-message">
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

  if (hasSpun && !wheel.allowRepeatSpins) {
    return (
      <div className="wheel-message">
        <p>{t('wheel.thanksParticipating')}</p>
      </div>
    );
  }

  // Build conic-gradient for wheel background
  const buildConicGradient = () => {
    const sliceAngle = 360 / wheel.prizes.length;
    const stops: string[] = [];
    
    wheel.prizes.forEach((_, index) => {
      const startAngle = sliceAngle * index;
      const color = index % 2 === 0 
        ? config.branding.primaryColor 
        : config.branding.secondaryColor;
      stops.push(`${color} ${startAngle}deg`);
      stops.push(`${color} ${startAngle + sliceAngle}deg`);
    });
    
    // Combine conic gradient with radial gradient for center highlight
    return `radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 50%), conic-gradient(${stops.join(', ')})`;
  };


  return (
    <div className="wheel-container">
      <div className="wheel-wrapper">
        <div className="wheel-pointer">▼</div>
        <div 
          className={`wheel ${isSpinning ? 'spinning' : ''} ${selectedPrizeIndex !== null && !isSpinning ? 'stopped' : ''}`}
          data-prizes-count={wheel.prizes.length}
          style={{
            background: buildConicGradient(),
            transform: `rotate(${wheelRotation}deg)`,
            transition: isSpinning 
              ? 'transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)'
              : selectedPrizeIndex !== null && !isSpinning
              ? 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              : 'none',
            filter: isSpinning ? 'blur(1.5px)' : 'blur(0px)',
            willChange: isSpinning ? 'transform, filter' : 'auto',
            ...(selectedPrizeIndex !== null && !isSpinning ? {
              '--slice-angle': `${360 / wheel.prizes.length}deg`,
              '--start-angle': `${(360 / wheel.prizes.length) * selectedPrizeIndex}deg`,
            } : {})
          } as React.CSSProperties}
        >
        {wheel.prizes.map((prize, index) => {
          const sliceAngle = 360 / wheel.prizes.length;
          const startAngle = sliceAngle * index;
          const midAngle = startAngle + sliceAngle / 2;
          const isWinningSlice = selectedPrizeIndex === index && !isSpinning;
          
          // Adjust radius based on number of prizes (max 6)
          const numPrizes = Math.min(wheel.prizes.length, 6);
          const radius = numPrizes <= 4 ? 38 : numPrizes === 5 ? 36 : 35;
          const angleRad = ((midAngle - 90) * Math.PI) / 180;
          const x = 50 + radius * Math.cos(angleRad);
          const y = 50 + radius * Math.sin(angleRad);
          
          return (
            <div
              key={index}
              className={`wheel-label ${isWinningSlice ? 'winning' : ''}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${midAngle}deg)`,
              } as React.CSSProperties}
            >
              {prize.iconUrl && (
                <img src={prize.iconUrl} alt={prize.label} className="prize-icon" />
              )}
              <span className="slice-label">
                {prize.label}
              </span>
            </div>
          );
        })}
        </div>
      </div>
      <div className="wheel-prize-strip">
        {wheel.prizes.map((prize, idx) => (
          <span key={idx} className="wheel-prize-chip">{prize.label}</span>
        ))}
      </div>
      <div className="skill-meter-wrap">
        <div className="skill-meter-label">Skill shot: {skillLabel}</div>
        <div className="skill-meter"><span style={{ left: `${skillValue}%` }} /></div>
        <button className="lock-skill-button" onClick={lockSkill} disabled={skillLocked || isSpinning}>{skillLocked ? 'Locked' : 'Lock timing'}</button>
      </div>
      <div className="spin-button-container">
        <button 
          className={`spin-button ${buttonShake ? 'shake' : ''}`}
          onClick={handleSpin}
          disabled={isSpinning}
        >
          {isSpinning ? t('wheel.spinning') : t('wheel.spinButton')}
        </button>
        {showBlockedTooltip && (
          <div className="blocked-tooltip">
            {skillLocked ? t('wheel.alreadyTried') : 'Lock timing first to start the spin 🎯'}
          </div>
        )}
      </div>
    </div>
  );
}

