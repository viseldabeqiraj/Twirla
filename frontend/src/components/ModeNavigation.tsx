import { useNavigate } from 'react-router-dom';
import { ExperienceMode } from '../types/ShopConfig';
import './ModeNavigation.css';

interface ModeNavigationProps {
  currentMode: string;
  shopName: string;
  uniqueId: string;
  availableModes?: ExperienceMode[];
}

const modeMeta: Record<ExperienceMode, { label: string; path: string; emoji: string }> = {
  [ExperienceMode.Wheel]: { label: 'Wheel', path: 'wheel', emoji: '🎯' },
  [ExperienceMode.TapHearts]: { label: 'Tap Hearts', path: 'taphearts', emoji: '💗' },
  [ExperienceMode.Scratch]: { label: 'Scratch', path: 'scratch', emoji: '✨' },
  [ExperienceMode.Countdown]: { label: 'Countdown', path: 'countdown', emoji: '⏳' },
};

const normalizeMode = (mode: string): ExperienceMode | null => {
  const m = mode.toLowerCase();
  if (m === 'wheel') return ExperienceMode.Wheel;
  if (m === 'taphearts' || m === 'tap-hearts') return ExperienceMode.TapHearts;
  if (m === 'scratch') return ExperienceMode.Scratch;
  if (m === 'countdown') return ExperienceMode.Countdown;
  return null;
};

export default function ModeNavigation({ currentMode, shopName, uniqueId, availableModes }: ModeNavigationProps) {
  const navigate = useNavigate();
  const currentNormalized = normalizeMode(currentMode);
  const allModes: ExperienceMode[] = availableModes || [ExperienceMode.Wheel, ExperienceMode.TapHearts, ExperienceMode.Scratch, ExperienceMode.Countdown];

  const handleModeChange = (mode: ExperienceMode) => {
    navigate(`/${modeMeta[mode].path}/${shopName}/${uniqueId}`);
  };

  return (
    <nav className="mode-navigation">
      <div className="mode-nav-container">
        <div className="mode-nav-buttons">
          {allModes.map((mode) => (
            <button key={mode} className={`mode-nav-button ${currentNormalized === mode ? 'active' : ''}`} onClick={() => handleModeChange(mode)}>
              <span>{modeMeta[mode].emoji}</span> {modeMeta[mode].label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

