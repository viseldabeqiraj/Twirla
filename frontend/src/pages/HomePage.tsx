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
      <header className="home-hero">
        <img
          src={resolveAssetUrl('/logos/twirla-transparent.png')}
          alt="Twirla"
          className="home-hero-logo"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (img.src && !img.src.includes('twirla.png')) {
              img.src = resolveAssetUrl('/logos/twirla.png');
              img.onerror = () => { img.style.display = 'none'; };
            } else {
              img.style.display = 'none';
            }
          }}
        />
        <p className="home-hero-tagline">Platformë interaktive për biznese.</p>
      </header>

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
        <p className="home-demo-title">Try the playground (all games)</p>
        <div className="home-demo-links">
          <a href="/wheel/demo/allgames01">Wheel</a>
          <a href="/taphearts/demo/allgames01">Catch the Prize</a>
          <a href="/scratch/demo/allgames01">Scratch</a>
          <a href="/countdown/demo/allgames01">Countdown</a>
        </div>
        <p className="home-demo-title">Demo campaign landings (layouts & branding)</p>
        <div className="home-demo-links">
          <a href="/shop/demo-shop">Thread &amp; Fold (clothing) — demo-shop</a>
          <a href="/shop/demo-bakery-luna">Rose &amp; Crumb (bakery) — demo-bakery-luna</a>
          <a href="/shop/demo-arcade-night">Aurelia &amp; Co. (jewellery) — demo-arcade-night</a>
          <a href="/shop/campaign-preview">campaign-preview (saved draft)</a>
        </div>
        <p className="home-demo-links">
          <a href="/setup/campaign">Campaign setup (code → form → save draft → preview)</a>
          <a href="/memory/demo/allgames01">Memory match demo</a>
        </p>
        <p className="home-demo-admin">
          <a href="/admin/demo?token=demo-admin-token">Open demo admin dashboard</a>
        </p>
      </div>
    </div>
  );
}
