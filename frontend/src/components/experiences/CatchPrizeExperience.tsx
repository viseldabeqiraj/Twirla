import { useEffect, useRef } from 'react';
import { ShopConfig } from '../../types/ShopConfig';
import { trackEvent } from '../../api/analyticsApi';
import CatchPrizeGame from '../../games/catchPrize/CatchPrizeGame';

interface CatchPrizeExperienceProps {
  config: ShopConfig;
}

export default function CatchPrizeExperience({ config }: CatchPrizeExperienceProps) {
  const { tapHearts, text, cta, branding, shopId } = config;
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    if (!hasTrackedPageView.current && tapHearts) {
      hasTrackedPageView.current = true;
      trackEvent(shopId, 'page_view', { mode: 'TapHearts' });
    }
  }, [shopId, tapHearts]);

  if (!tapHearts) return null;

  const handleGameStart = () => {
    trackEvent(shopId, 'game_start', { mode: 'TapHearts' });
  };

  const handleGameEnd = (payload: { score: number; won: boolean }) => {
    trackEvent(shopId, 'game_finish', { mode: 'TapHearts' });
    if (payload.won) trackEvent(shopId, 'reward_won', { mode: 'TapHearts' });
  };

  return (
    <CatchPrizeGame
      outcomes={tapHearts.outcomes}
      ctaLabel={text.ctaText}
      ctaUrl={cta.url}
      primaryColor={branding.primaryColor}
      onGameStart={handleGameStart}
      onGameEnd={handleGameEnd}
    />
  );
}
