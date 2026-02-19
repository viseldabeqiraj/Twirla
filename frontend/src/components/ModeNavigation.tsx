import { useNavigate } from 'react-router-dom';
import { ExperienceMode } from '../types/ShopConfig';
import './ModeNavigation.css';

interface ModeNavigationProps {
  currentMode: string;
  shopName: string;
  uniqueId: string;
  availableModes?: ExperienceMode[];
}

const modeLabels: Record<string, string> = {
  Wheel: 'Wheel',
  TapHearts: 'Tap Hearts',
  Scratch: 'Scratch',
  Countdown: 'Countdown'
};

export default function ModeNavigation({ 
  currentMode, 
  shopName, 
  uniqueId,
  availableModes
}: ModeNavigationProps) {
  const navigate = useNavigate();
  const allModes: ExperienceMode[] = availableModes || [
    ExperienceMode.Wheel,
    ExperienceMode.TapHearts,
    ExperienceMode.Scratch,
    ExperienceMode.Countdown
  ];

  const handleModeChange = (mode: string) => {
    navigate(`/${mode}/${shopName}/${uniqueId}`);
  };

  return (
    <nav className="mode-navigation">
      <div className="mode-nav-container">
        <div className="mode-nav-buttons">
          {allModes.map((mode) => (
            <button
              key={mode}
              className={`mode-nav-button ${currentMode === mode ? 'active' : ''}`}
              onClick={() => handleModeChange(mode)}
            >
              {modeLabels[mode] || mode}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

