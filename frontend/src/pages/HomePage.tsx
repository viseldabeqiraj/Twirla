import { useState } from 'react';
import Confetti from '../components/Confetti';
import ScratchCard from '../components/ScratchCard';
import { resolveAssetUrl } from '../config/api';
import './HomePage.css';

export default function HomePage() {
  const [showConfetti, setShowConfetti] = useState(false);

  const hiddenContent = (
    <div className="home-scratch-reveal-panel">
      <h2 className="home-scratch-reveal-title">SË SHPEJTI</h2>
      <p className="home-scratch-reveal-subtitle">Lojëra interaktive për dyqanet.</p>
    </div>
  );

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-hero">
          <img
            src={resolveAssetUrl('/logos/twirla.png')}
            alt="Twirla"
            className="home-hero-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <p className="home-hero-tagline">Platformë interaktive për biznese.</p>
        </div>

        <div className="home-scratch-section">
          <ScratchCard
            instructionText="Gërvisht këtu"
            hiddenContent={hiddenContent}
            revealThreshold={50}
            onReveal={() => setShowConfetti(true)}
            aspectRatio="16/10"
          />
          {showConfetti && <Confetti count={40} />}
        </div>

        {/* Demo section hidden for launch teaser */}
        <div className="home-demo-section home-demo-section--hidden" aria-hidden="true">
          <p className="home-demo-title">Try the demo shop (all games)</p>
          <div className="home-demo-links">
            <a href="/wheel/demo/allgames01">Wheel</a>
            <a href="/taphearts/demo/allgames01">Catch the Prize</a>
            <a href="/scratch/demo/allgames01">Scratch</a>
            <a href="/countdown/demo/allgames01">Countdown</a>
          </div>
          <p className="home-demo-admin">
            <a href="/admin/demo?token=demo-admin-token">Open demo admin dashboard</a>
          </p>
        </div>
      </div>
    </div>
  );
}
