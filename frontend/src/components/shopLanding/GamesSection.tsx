import { Link } from 'react-router-dom';
import type { ExperienceMode } from '../../types/ShopConfig';
import type { ShopLandingConfig } from '../../types/ShopLandingConfig';
import { useTranslation } from '../../i18n/i18n';

interface GamesSectionProps {
  enabledGames: ExperienceMode[];
  /** Primary game shown above the fold; links to this game. */
  featuredGame?: ExperienceMode;
  experiencePath: ShopLandingConfig['experiencePath'];
  sectionTitle?: string;
}

const GAME_META: Record<string, { key: string; path: string; emoji: string }> = {
  Runner: { key: 'nav.runner', path: 'runner', emoji: '🏃' },
  Wheel: { key: 'nav.wheel', path: 'wheel', emoji: '🎯' },
  TapHearts: { key: 'nav.tapHearts', path: 'taphearts', emoji: '🎁' },
  Scratch: { key: 'nav.scratch', path: 'scratch', emoji: '✨' },
  Countdown: { key: 'nav.countdown', path: 'countdown', emoji: '⏳' },
};

export default function GamesSection({
  enabledGames,
  featuredGame,
  experiencePath,
}: GamesSectionProps) {
  const { t } = useTranslation();
  if (enabledGames.length === 0) return null;

  const { shopName, uniqueId } = experiencePath;
  const featured = featuredGame && GAME_META[featuredGame] && enabledGames.includes(featuredGame)
    ? featuredGame
    : enabledGames[0];
  const moreGames = enabledGames.filter((m) => m !== featured);
  const featuredMeta = GAME_META[featured];
  if (!featuredMeta) return null;

  const featuredTo = `/${featuredMeta.path}/${shopName}/${uniqueId}`;

  return (
    <>
      {/* Featured game – primary CTA target, above the fold / early scroll */}
      <section
        id="featured-game"
        className="shop-section shop-featured-game"
        aria-labelledby="featured-game-title"
      >
        <div className="shop-section-inner">
          <h2 id="featured-game-title" className="shop-featured-game-title">
            {t('campaign.featuredGame')}
          </h2>
          <Link to={featuredTo} className="shop-featured-game-card">
            <span className="shop-featured-game-emoji" aria-hidden>{featuredMeta.emoji}</span>
            <span className="shop-featured-game-label">{t(featuredMeta.key)}</span>
            <span className="shop-featured-game-cta">{t('campaign.playNow')}</span>
          </Link>
        </div>
      </section>

      {/* More ways to win – secondary games */}
      {moreGames.length > 0 && (
        <section className="shop-section shop-games">
          <div className="shop-section-inner">
            <h2 className="shop-section-title">{t('campaign.moreWaysToWin')}</h2>
            <div className="shop-games-grid">
              {moreGames.map((mode) => {
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
      )}
    </>
  );
}
