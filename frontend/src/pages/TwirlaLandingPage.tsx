import { useState } from 'react';
import { resolveAssetUrl } from '../config/api';
import TwirlaPhoneDemo from '../components/TwirlaPhoneDemo';
import './TwirlaLandingPage.css';

const NAV_LINKS = [
  { href: '#about', label: 'Rreth nesh' },
  { href: '#how', label: 'Si funksionon' },
  { href: '#services', label: 'Shërbimet' },
  { href: '#demo', label: 'Demo' },
];

const DEMO_SHOPS = [
  {
    name: 'Astra Accessories',
    slug: 'astra-accessories',
    logo: resolveAssetUrl('/logos/astra-accessories.png'),
    description: 'Mini landing page me lojë rrotull dhe integrim DM për porosi.',
    visualClass: 'tw-work-card-visual--astra',
    featured: true,
  },
  {
    name: 'Urban Glow',
    slug: 'urban-glow',
    logo: resolveAssetUrl('/logos/urban-glow.png'),
    description: 'Dyqan kozmetike me skincare, makeup dhe zbritje — luaj për kode ekskluzive në DM.',
    visualClass: 'tw-work-card-visual--urban',
    featured: false,
  },
];

const SERVICES = [
  {
    icon: '🎡',
    title: 'Lojëra për të fituar zbritje',
    desc: 'Rrotull, gërvishtje, kap çmimin — klientët fitojnë kode zbritjeje duke luajtur.',
  },
  {
    icon: '📱',
    title: 'Mini landing page',
    desc: 'Një faqe e bukur për dyqanin tënd, pa website kompleks ose Shopify.',
  },
  {
    icon: '💬',
    title: 'Integrim me DM',
    desc: 'Klientët dërgojnë kodin e fituar direkt në Instagram DM për porosi.',
  },
  {
    icon: '📊',
    title: 'Panel admin',
    desc: 'Shiko statistika, menaxho lojërat dhe ndiq konvertimet nga një vend.',
  },
  {
    icon: '🎨',
    title: 'Branding i personalizuar',
    desc: 'Ngjyra, logo dhe stil që përputhen me identitetin e dyqanit tënd.',
  },
  {
    icon: '⚡',
    title: 'Gati për Instagram',
    desc: 'Optimizuar për mobile — klientët hapin linkun nga story ose bio.',
  },
];

const STEPS = [
  'Klienti hap faqen',
  'Luajn një lojë',
  'Fiton kod zbritjeje',
  'Dërgon kodin në DM',
  'Ti mbyll porosinë',
];

const FAQ_ITEMS = [
  {
    q: 'Për kë lloj dyqanesh është Twirla?',
    a: 'Për çdo dyqan Instagram që shet produkte fizike ose dixhitale — aksesorë, veshje, ushqime, kozmetikë dhe më shumë.',
  },
  {
    q: 'A duhet website i veçantë?',
    a: 'Jo. Twirla krijon një mini landing page për ty. Ti vendos linkun në bio ose story të Instagram-it.',
  },
  {
    q: 'Sa kushton?',
    a: 'Dyqanet e para e provojnë falas gjatë fazës së testimit. Na shkruaj në Instagram për detaje.',
  },
  {
    q: 'Sa kohë duhet për ta nisur?',
    a: 'Pas një bisede të shkurtër, ne krijojmë faqen me lojë brenda disa ditësh. Ti sjell produktet dhe brandingun.',
  },
  {
    q: 'Si kontaktohem?',
    a: 'Na shkruaj në Instagram DM — përgjigjemi brenda 24 orëve dhe ta ndërtojmë një version demo.',
  },
];

export default function TwirlaLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(resolveAssetUrl('/logos/twirla-transparent.png'));
  const [logoFailed, setLogoFailed] = useState(false);

  const handleLogoError = () => {
    if (logoSrc.includes('twirla-transparent')) {
      setLogoSrc(resolveAssetUrl('/logos/twirla.png'));
      return;
    }
    setLogoFailed(true);
  };

  return (
    <div className="tw-page">
      <header className="tw-header">
        <div className="tw-container tw-header-inner">
          <a href="/" className="tw-brand" aria-label="Twirla">
            {!logoFailed ? (
              <img
                src={logoSrc}
                alt="Twirla"
                className="tw-brand-logo"
                onError={handleLogoError}
              />
            ) : (
              <span className="tw-brand-name">Twirla</span>
            )}
          </a>

          <nav className={`tw-nav ${menuOpen ? 'tw-nav--open' : ''}`} aria-label="Kryesore">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="tw-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a href="#contact" className="tw-btn tw-btn--primary tw-nav-cta" onClick={() => setMenuOpen(false)}>
              Provoje falas
            </a>
          </nav>

          <button
            type="button"
            className="tw-menu-toggle"
            aria-expanded={menuOpen}
            aria-label="Hap menunë"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        <section className="tw-hero">
          <div className="tw-container tw-hero-grid">
            <div className="tw-hero-copy">
              <span className="tw-eyebrow">Për cdo biznes</span>
              <h1>Kthe vizitorët në blerës me lojëra interaktive.</h1>
              <p>
                Twirla i jep dyqanit tënd një mini landing page ku klientët luajnë,
                fitojnë zbritje dhe ta dërgojnë kodin në DM për porosi.
              </p>
              <div className="tw-hero-actions">
                <a href="#contact" className="tw-btn tw-btn--primary">Provoje falas</a>
                <a href="#how" className="tw-btn tw-btn--outline">Si funksionon</a>
              </div>
            </div>

            <div className="tw-hero-visual" aria-hidden="true">
              <TwirlaPhoneDemo />
            </div>
          </div>
        </section>

        <section id="services" className="tw-section tw-section--muted">
          <div className="tw-container">
            <div className="tw-section-head">
              <span className="tw-eyebrow">Çfarë ofrojmë</span>
              <h2>Gjithçka që i duhet biznesit tënd</h2>
              <p>
                Landing page dhe lojëra për të rritur angazhimin dhe porositë përmes DM.
              </p>
            </div>
            <div className="tw-services-grid">
              {SERVICES.map((service) => (
                <article className="tw-service-card" key={service.title}>
                  <span className="tw-service-icon">{service.icon}</span>
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="tw-section">
          <div className="tw-container">
            <div className="tw-section-head tw-section-head--center">
              <span className="tw-eyebrow">Si funksionon</span>
              <h2>5 hapa drejt porosisë</h2>
              <p>Klienti kalon nga story te DM — pa friction, pa website të komplikuar.</p>
            </div>
            <div className="tw-steps">
              {STEPS.map((step, index) => (
                <div className="tw-step" key={step}>
                  <span className="tw-step-num">{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="tw-section tw-section--muted">
          <div className="tw-container tw-about-grid">
            <div>
              <span className="tw-eyebrow">Rreth nesh</span>
              <h2>Pse ka kuptim për dyqanin tënd?</h2>
              <p>
                Sepse një zbritje normale është e mërzitshme. Një lojë e bën klientin
                të ndalet, të provojë fatin dhe të ketë arsye të të shkruajë tani.
              </p>
            </div>
            <div className="tw-benefits">
              {['Më shumë DM', 'Më shumë angazhim', 'Më shumë arsye për blerje', 'Pa website kompleks'].map(
                (benefit) => (
                  <div className="tw-benefit" key={benefit}>
                    <span className="tw-benefit-check">✓</span>
                    {benefit}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section id="demo" className="tw-section">
          <div className="tw-container">
            <div className="tw-section-head tw-section-head--center">
              <span className="tw-eyebrow">Demo reale</span>
              <h2>Shiko punën tonë</h2>
              <p>
                Shembull dyqani për aksesorë ku klientët hapin lojën, fitojnë zbritje
                dhe ta përdorin kodin në DM.
              </p>
            </div>
            <div className="tw-work-grid">
              {DEMO_SHOPS.map((shop) => (
                <article
                  className={`tw-work-card${shop.featured ? ' tw-work-card--featured' : ''}`}
                  key={shop.slug}
                >
                  <div className={`tw-work-card-visual ${shop.visualClass}`}>
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="tw-work-card-logo"
                      loading="lazy"
                    />
                  </div>
                  <div className="tw-work-card-body">
                    <h3>{shop.name}</h3>
                    <p>{shop.description}</p>
                    <a href={`/shop/${shop.slug}`} className="tw-link-arrow">
                      Hap demo
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="tw-reviews">
          <div className="tw-container tw-reviews-inner">
            <div className="tw-reviews-score">
              <strong>5.0</strong>
              <span>Bazuar në feedback nga dyqanet e para</span>
            </div>
            <div className="tw-reviews-stars" aria-hidden="true">
              {'★★★★★'}
            </div>
          </div>
        </section>

        <section className="tw-section tw-section--muted">
          <div className="tw-container">
            <div className="tw-section-head tw-section-head--center">
              <span className="tw-eyebrow">Çmimet</span>
              <h2>Dyqanet e para e provojnë falas</h2>
              <p>
                Po marrim disa dyqane të para për testim. Ti sjell produktet,
                ne të krijojmë faqen me lojë.
              </p>
            </div>
            <div className="tw-pricing-card">
              <div className="tw-pricing-header">
                <h3>Early Access</h3>
                <div className="tw-pricing-price">
                  <span className="tw-pricing-amount">Falas</span>
                  <span className="tw-pricing-period">për dyqanet e para</span>
                </div>
              </div>
              <ul className="tw-pricing-features">
                <li>Mini landing page e personalizuar</li>
                <li>2+ lojëra për të fituar zbritje</li>
                <li>Integrim me Instagram DM</li>
                <li>Panel admin me statistika</li>
                <li>Mbështetje gjatë nisjes</li>
              </ul>
              <a href="#contact" className="tw-btn tw-btn--primary tw-btn--block">
                Rezervo vendin tënd
              </a>
            </div>
          </div>
        </section>

        <section className="tw-section">
          <div className="tw-container tw-faq-wrap">
            <div className="tw-section-head">
              <span className="tw-eyebrow">FAQ</span>
              <h2>Pyetje të shpeshta</h2>
            </div>
            <div className="tw-faq-list">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div className={`tw-faq-item ${isOpen ? 'tw-faq-item--open' : ''}`} key={item.q}>
                    <button
                      type="button"
                      className="tw-faq-question"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      {item.q}
                      <span className="tw-faq-icon" aria-hidden="true" />
                    </button>
                    <div className="tw-faq-answer">
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="tw-contact">
          <div className="tw-container tw-contact-grid">
            <div className="tw-contact-copy">
              <span className="tw-eyebrow tw-eyebrow--light">Kontakt</span>
              <h2>Do ta provosh për dyqanin tënd?</h2>
              <p>
                Gati të rritësh angazhimin? Na shkruaj sot dhe zbulo si mund ta
                sjellim vizionin tënd në jetë.
              </p>
            </div>
            <div className="tw-contact-action">
              <a
                className="tw-btn tw-btn--light"
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Na shkruaj në Instagram
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="tw-footer">
        <div className="tw-container tw-footer-inner">
          <a href="/" className="tw-footer-brand" aria-label="Twirla">
            {!logoFailed ? (
              <img
                src={logoSrc}
                alt="Twirla"
                className="tw-footer-logo"
                onError={handleLogoError}
              />
            ) : (
              'Twirla'
            )}
          </a>
          <p className="tw-footer-copy">© {new Date().getFullYear()} Twirla. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </footer>
    </div>
  );
}
