import { Link, useNavigate } from 'react-router-dom';
import { ExperienceMode } from '../types/ShopConfig';
import { useTranslation } from '../i18n/i18n';
import './ModeNavigation.css';

interface ModeNavigationProps {
  /** Current experience mode (e.g. 'runner', 'wheel'). Omit or null when on shop landing. */
  currentMode?: string | null;
  shopName: string;
  uniqueId: string;
  availableModes?: ExperienceMode[];
  /** When true, we're on the shop landing page; main link is active. */
  isShopLanding?: boolean;
  /** When true, hide game tabs and only show "Back to shop" (for public campaign experience). */
  hideGameTabs?: boolean;
}

const modeMeta: Record<ExperienceMode, { path: string; emoji: string; key: string }> = {
  [ExperienceMode.Runner]: { path: 'runner', emoji: '🏃', key: 'nav.runner' },
  [ExperienceMode.Wheel]: { path: 'wheel', emoji: '🎯', key: 'nav.wheel' },
  [ExperienceMode.TapHearts]: { path: 'taphearts', emoji: '🎁', key: 'nav.tapHearts' },
  [ExperienceMode.Scratch]: { path: 'scratch', emoji: '✨', key: 'nav.scratch' },
  [ExperienceMode.Countdown]: { path: 'countdown', emoji: '⏳', key: 'nav.countdown' },
  [ExperienceMode.MemoryMatch]: { path: 'memory', emoji: '🃏', key: 'memoryMatch.title' },
};

const normalizeMode = (mode: string): ExperienceMode | null => {
  const m = mode.toLowerCase();
  if (m === 'runner') return ExperienceMode.Runner;
  if (m === 'wheel') return ExperienceMode.Wheel;
  if (m === 'taphearts' || m === 'tap-hearts') return ExperienceMode.TapHearts;
  if (m === 'scratch') return ExperienceMode.Scratch;
  if (m === 'countdown') return ExperienceMode.Countdown;
  if (m === 'memory' || m === 'memorymatch') return ExperienceMode.MemoryMatch;
  return null;
};

export default function ModeNavigation({ currentMode = null, shopName, uniqueId, availableModes, isShopLanding = false, hideGameTabs = false }: ModeNavigationProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentNormalized = currentMode ? normalizeMode(currentMode) : null;
  const allModes: ExperienceMode[] = availableModes ?? [
    ExperienceMode.Runner,
    ExperienceMode.Wheel,
    ExperienceMode.TapHearts,
    ExperienceMode.Scratch,
    ExperienceMode.Countdown,
  ];

  const handleModeChange = (mode: ExperienceMode) => {
    navigate(`/${modeMeta[mode].path}/${shopName}/${uniqueId}`);
  };

  return (
    <nav className={`mode-navigation ${hideGameTabs ? 'mode-navigation-minimal' : ''}`} aria-label="Experience and shop navigation">
      <div className="mode-nav-container">
        <div className="mode-nav-inner">
          <Link
            to={`/shop/${shopName}`}
            className={`mode-nav-main-link ${isShopLanding ? 'active' : ''}`}
            aria-current={isShopLanding ? 'page' : undefined}
          >
            <span className="mode-nav-main-icon" aria-hidden>←</span>
            <span>{hideGameTabs ? t('nav.backToShop') : t('nav.mainPage')}</span>
          </Link>
          {!hideGameTabs && (
            <>
              <div className="mode-nav-divider" aria-hidden />
              <div className="mode-nav-buttons" role="tablist">
                {allModes.map((mode) => (
                  <button
                    key={mode}
                    role="tab"
                    aria-selected={currentNormalized === mode}
                    className={`mode-nav-button ${currentNormalized === mode ? 'active' : ''}`}
                    onClick={() => handleModeChange(mode)}
                  >
                    <span className="mode-nav-emoji" aria-hidden>{modeMeta[mode].emoji}</span>
                    <span>{t(modeMeta[mode].key)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

