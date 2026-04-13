import type { ExperienceMode } from '../../types/ShopConfig';
import type { ShopLandingConfig } from '../../types/ShopLandingConfig';
import { useTranslation } from '../../i18n/i18n';
import AnimatedGameCard from '../twirla-ui/AnimatedGameCard';

interface GamesSectionProps {
  enabledGames: ExperienceMode[];
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
  MemoryMatch: { key: 'memoryMatch.title', path: 'memory', emoji: '🃏' },
};

export default function GamesSection({
  enabledGames,
  featuredGame,
  experiencePath,
  sectionTitle,
}: GamesSectionProps) {
  const { t } = useTranslation();
  if (enabledGames.length === 0) return null;

  const { shopName, uniqueId } = experiencePath;
  const featured =
    featuredGame && GAME_META[featuredGame] && enabledGames.includes(featuredGame)
      ? featuredGame
      : enabledGames[0];
  const moreGames = enabledGames.filter((m) => m !== featured);
  const featuredMeta = GAME_META[featured];
  if (!featuredMeta) return null;

  const featuredTo = `/${featuredMeta.path}/${shopName}/${uniqueId}`;

  return (
    <>
      <section
        id="featured-game"
        className="shop-section shop-featured-game"
        aria-labelledby="featured-game-title"
      >
        <div className="shop-section-inner">
          <h2 id="featured-game-title" className="shop-featured-game-title">
            {sectionTitle?.trim() || t('campaign.featuredGame')}
          </h2>
          <p className="shop-featured-game-intro">{t('landing.gamesIntro')}</p>
          <AnimatedGameCard to={featuredTo} featured className="shop-featured-game-card">
            <span className="shop-featured-game-emoji" aria-hidden>
              {featuredMeta.emoji}
            </span>
            <div className="shop-featured-game-body">
              <span className="shop-featured-game-label">{t(featuredMeta.key)}</span>
              <span className="shop-featured-game-cta shop-landing-cta-invite">
                {t('campaign.ctaPlayWin')}
              </span>
            </div>
          </AnimatedGameCard>
        </div>
      </section>

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
                  <AnimatedGameCard key={mode} to={to} className="shop-game-card">
                    <span className="shop-game-emoji">{meta.emoji}</span>
                    <span className="shop-game-label">{t(meta.key)}</span>
                  </AnimatedGameCard>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
