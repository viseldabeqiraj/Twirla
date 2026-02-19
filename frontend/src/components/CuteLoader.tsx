import './CuteLoader.css';

export default function CuteLoader() {
  return (
    <div className="cute-loader-wrap">
      <div className="cute-loader-card">
        <div className="cute-bunny">
          <span className="ear ear-left" />
          <span className="ear ear-right" />
          <span className="face">૮ ˶ᵔ ᵕ ᵔ˶ ა</span>
        </div>
        <div className="loader-dots">
          <span />
          <span />
          <span />
        </div>
        <p>Loading your game magic…</p>
      </div>
    </div>
  );
}
