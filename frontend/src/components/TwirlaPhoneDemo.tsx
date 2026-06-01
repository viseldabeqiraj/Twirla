import { resolveAssetUrl } from '../config/api';
import './TwirlaPhoneDemo.css';

/** Real Astra Accessories assets from shop config */
const ASTRA_LOGO = resolveAssetUrl('/logos/astra-accessories.png');
const ASTRA_HERO_IMAGE =
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=640&q=80';

const ASTRA_PRODUCTS = [
  {
    name: 'Varëse minimaliste — gold',
    price: '2,400 ALL',
    imageUrl:
      'https://www.dylanoaks.com/cdn/shop/files/3cm_Letter_Bar_Necklace_Gold_1_2500x2500_crop_center.jpg?v=1767806576',
  },
  {
    name: 'Byzylyk stainless steel',
    price: '1,000 ALL',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  },
  {
    name: 'Unazë minimal — gold plated',
    price: '850 ALL',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  },
  {
    name: 'Varëse me perla — koleksioni i ri',
    price: '1,200 ALL',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS776yOOG9KPm004ZmEwS0YQh6we1u6vyG6Zg&s',
  },
];

function DemoScreenContent() {
  return (
    <>
      <header className="tw-demo-shop-header">
        <img src={ASTRA_LOGO} alt="" className="tw-demo-shop-logo" />
        <span className="tw-demo-shop-name">Astra Accessories</span>
      </header>

      <section className="tw-demo-shop-hero">
        <div
          className="tw-demo-shop-hero-banner"
          style={{ backgroundImage: `url(${ASTRA_HERO_IMAGE})` }}
        >
          <div className="tw-demo-shop-hero-overlay">
            <p className="tw-demo-shop-eyebrow">Koleksioni i ri</p>
            <h2 className="tw-demo-shop-title">Aksesorë që bien në sy</h2>
          </div>
        </div>
        <p className="tw-demo-shop-sub">Bizhuteri &amp; aksesorë — porosit përmes DM.</p>
      </section>

      <section className="tw-demo-products" aria-label="Produkte">
        <p className="tw-demo-section-label">Të zgjedhurat</p>
        <div className="tw-demo-product-grid">
          {ASTRA_PRODUCTS.map((p) => (
            <article className="tw-demo-product" key={p.name}>
              <div className="tw-demo-product-img-wrap">
                <img
                  src={p.imageUrl}
                  alt=""
                  className="tw-demo-product-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="tw-demo-product-name">{p.name}</p>
              <p className="tw-demo-product-price">{p.price}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tw-demo-game" aria-label="Loja">
        <p className="tw-demo-section-label">Loja e ditës</p>
        <div className="tw-demo-game-card">
          <div className="tw-demo-wheel" aria-hidden="true">
            <div className="tw-demo-wheel-inner" />
            <span className="tw-demo-wheel-pointer" />
          </div>
          <div className="tw-demo-game-copy">
            <h3>Rrotullo fatin</h3>
            <p>Fito deri në 30% zbritje</p>
            <span className="tw-demo-game-btn">Luaj tani</span>
          </div>
        </div>
      </section>

      <section className="tw-demo-result" aria-label="Rezultati">
        <div className="tw-demo-result-card">
          <p className="tw-demo-result-badge">🎉 Fituat 15% zbritje</p>
          <p className="tw-demo-result-code">
            Kodi: <strong>ASTRA-15</strong>
          </p>
          <p className="tw-demo-result-hint">Vlen për aksesorë &amp; bizhuteri</p>
        </div>
      </section>

      <section className="tw-demo-dm" aria-label="Porosi">
        <div className="tw-demo-dm-card">
          <span className="tw-demo-dm-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </span>
          <div>
            <p className="tw-demo-dm-title">Dërgo kodin në DM</p>
            <p className="tw-demo-dm-sub">Na shkruaj &ldquo;ASTRA-15&rdquo; për porosi</p>
          </div>
          <span className="tw-demo-dm-btn">Hap Instagram</span>
        </div>
      </section>

      <div className="tw-demo-spacer" aria-hidden="true" />
    </>
  );
}

export default function TwirlaPhoneDemo() {
  return (
    <div className="tw-demo-scene" aria-hidden="true">
      <div className="tw-demo-glow tw-demo-glow--a" />
      <div className="tw-demo-glow tw-demo-glow--b" />
      <div className="tw-demo-ring" />

      <div className="tw-demo-phone">
        <div className="tw-demo-notch" />
        <div className="tw-demo-bezel">
          <div className="tw-demo-viewport">
            <div className="tw-demo-scroll">
              <div className="tw-demo-scroll-inner">
                <DemoScreenContent />
                <DemoScreenContent />
              </div>
            </div>
            <div className="tw-demo-fade-top" />
            <div className="tw-demo-fade-bottom" />
          </div>
        </div>

        <div className="tw-demo-popup">
          <span className="tw-demo-popup-dot" />
          <span className="tw-demo-popup-text">15% zbritje e fituar</span>
        </div>
      </div>
    </div>
  );
}
