import { Link } from 'react-router-dom';
import type { ExperienceMode } from '../../types/ShopConfig';
import type { ShopLandingConfig } from '../../types/ShopLandingConfig';
import { useTranslation } from '../../i18n/i18n';

interface GamesSectionProps {
  enabledGames: ExperienceMode[];
  experiencePath: ShopLandingConfig['experiencePath'];
  sectionTitle?: string;
}

const GAME_META: Record<ExperienceMode, { key: string; path: string; emoji: string }> = {
  Runner: { key: 'nav.runner', path: 'runner', emoji: '🏃' },
  Wheel: { key: 'nav.wheel', path: 'wheel', emoji: '🎯' },
  TapHearts: { key: 'nav.tapHearts', path: 'taphearts', emoji: '🎁' },
  Scratch: { key: 'nav.scratch', path: 'scratch', emoji: '✨' },
  Countdown: { key: 'nav.countdown', path: 'countdown', emoji: '⏳' },
};

export default function GamesSection({
  enabledGames,
  experiencePath,
  sectionTitle = 'Play & Win',
}: GamesSectionProps) {
  const { t } = useTranslation();
  if (enabledGames.length === 0) return null;

  const { shopName, uniqueId } = experiencePath;

  return (
    <section className="shop-section shop-games">
      <div className="shop-section-inner">
        <h2 className="shop-section-title">{sectionTitle}</h2>
        <p className="shop-section-subtitle">Try our games and win rewards</p>
        <div className="shop-games-grid">
          {enabledGames.map((mode) => {
            const meta = GAME_META[mode];
            if (!meta) return null;
            const to = `/${meta.path}/${shopName}/${uniqueId}`;
            return (
              <Link
                key={mode}
                to={to}
                className="shop-game-card"
              >
                <span className="shop-game-emoji">{meta.emoji}</span>
                <span className="shop-game-label">{t(meta.key)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
