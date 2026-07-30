import { useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/i18n';

interface PlayFabProps {
  /** DOM id of the game section to scroll to and watch. */
  targetId: string;
}

/**
 * Floating "Play & win" button that nudges visitors back to the game once
 * they've scrolled past it, and hides itself again while the game section is
 * actually in view. Ported from the shop demo's sticky play CTA.
 */
export default function PlayFab({ targetId }: PlayFabProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: '-10% 0px' },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [targetId]);

  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <button
      type="button"
      className={`shop-play-fab ${visible ? 'shop-play-fab--visible' : ''}`}
      onClick={handleClick}
    >
      {t('campaign.ctaPlayWin')}
    </button>
  );
}
