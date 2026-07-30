import { useEffect, useState } from 'react';
import { resolveAssetUrl } from '../config/api';
import TwirlaPhoneDemo from '../components/TwirlaPhoneDemo';
import TwirlaWheelShowcase from '../components/TwirlaWheelShowcase';
import './TwirlaLandingPage.css';

const ABOUT_STATS = [
  { n: 3, suffix: 'x', label: 'Herë më shumë angazhim' },
  { n: 70, suffix: '%', label: "Ndjekës që s'blejnë menjëherë" },
  { n: 0, suffix: '€', label: 'Website i nevojshëm' },
  { n: 2, suffix: ' min', label: "Për t'u ngritur me ne" },
];

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

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('tw-landing-theme') as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });
  const toggleTheme = () =>
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('tw-landing-theme', next);
      } catch {
        /* ignore */
      }
      return next;
    });

  // Cursor-following spotlight on cards (sets --mx / --my used by CSS glow)
  useEffect(() => {
    const selector = '.tw-service-card, .tw-vs-card, .tw-work-card, .tw-pricing-card, .tw-step';
    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement | null)?.closest?.(selector) as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Count-up animation for the About stat cards when they scroll into view
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.tw-stat-value[data-count]'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          const target = Number(el.dataset.count || 0);
          const suffix = el.dataset.suffix || '';
          if (target === 0) {
            el.textContent = `0${suffix}`;
            return;
          }
          let c = 0;
          const inc = Math.max(1, Math.round(target / 30));
          const timer = window.setInterval(() => {
            c += inc;
            if (c >= target) {
              c = target;
              window.clearInterval(timer);
            }
            el.textContent = `${c}${suffix}`;
          }, 24);
        });
      },
      { threshold: 0.4 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="tw-page" data-theme={theme}>
      <header className="tw-header">
        <div className="tw-header-bg" aria-hidden="true" />
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
            className="tw-theme-toggle"
            aria-label="Ndrysho temën"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

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
          <div className="tw-hero-lights" aria-hidden="true">
            <span className="tw-hero-orb tw-hero-orb--a" />
            <span className="tw-hero-orb tw-hero-orb--b" />
          </div>
          <div className="tw-container tw-hero-grid">
            <div className="tw-hero-copy">
              <span className="tw-eyebrow">Për cdo biznes</span>
              <h1>
                Kthe vizitorët në blerës me <span className="tw-grad-text">lojëra interaktive</span>.
              </h1>
              <p>
                Twirla i jep dyqanit tënd një mini landing page ku klientët luajnë,
                fitojnë zbritje dhe ta dërgojnë kodin në DM për porosi. Pa website. Pa Shopify.
              </p>
              <ul className="tw-hero-chips">
                <li>🎯 Më shumë angazhim</li>
                <li>💬 Më shumë DM</li>
                <li>🛍️ Më shumë porosi</li>
              </ul>
              <div className="tw-hero-actions">
                <a href="#contact" className="tw-btn tw-btn--primary">Provoje falas</a>
                <a href="#how" className="tw-btn tw-btn--outline">Si funksionon</a>
              </div>
              <p className="tw-hero-trust">
                Falas për dyqanet e para · Gati brenda pak ditësh · Pa kartë krediti
              </p>
            </div>

            <div className="tw-hero-visual">
              <span className="tw-hero-floater tw-hero-floater--1"><span>💬</span> +18 DM sot</span>
              <span className="tw-hero-floater tw-hero-floater--2"><span>🎁</span> Dhuratë falas</span>
              <span className="tw-hero-floater tw-hero-floater--3"><span>🔥</span> -30% zbritje</span>
              <span className="tw-hero-floater tw-hero-floater--4"><span>🛍️</span> Porosi e re</span>
              <TwirlaPhoneDemo />
            </div>
          </div>
        </section>

        <section className="tw-wheel-demo">
          <div className="tw-container tw-wheel-demo-inner">
            <span className="tw-eyebrow">Loja</span>
            <h2>Rrotullo dhe fito</h2>
            <p className="tw-section-lead">
              Kështu e përjeton klienti — rrotullon rrotën, fiton një kod zbritjeje dhe ta dërgon në DM.
            </p>
            <TwirlaWheelShowcase />
          </div>
        </section>

        <section id="why" className="tw-section">
          <div className="tw-container">
            <div className="tw-section-head tw-section-head--center">
              <span className="tw-eyebrow">Pse lojëra</span>
              <h2>Një zbritje që e <em>fiton</em> vlen më shumë se një që ta japin</h2>
              <p className="tw-section-lead">
                I njëjti kupon, psikologji krejt tjetër — dhe shumë më shumë gjasa që klienti të të shkruajë.
              </p>
            </div>
            <div className="tw-vs">
              <article className="tw-vs-card tw-vs-card--old">
                <span className="tw-vs-tag">Mënyra e vjetër, e mërzitshme</span>
                <h3>“10% zbritje” në Story 😐</h3>
                <p>
                  Kodin e ka kushdo, ndaj s'ka vlerë në mendjen e klientit. E kalon Story-n dhe nuk të
                  shkruan kurrë. Pak angazhim, pak DM.
                </p>
              </article>
              <article className="tw-vs-card tw-vs-card--new">
                <span className="tw-vs-tag tw-vs-tag--good">Mënyra Twirla</span>
                <h3>Luajnë dhe fitojnë 🎉</h3>
                <p>
                  Mundësia reale për të fituar i bën të provojnë. Kur “fitojnë” kodin, vlera e perceptuar
                  shumëfishohet — kështu shumë më shumë veta e dërgojnë në DM për ta përdorur.
                </p>
              </article>
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
            <div className="tw-about-stats">
              {ABOUT_STATS.map((s) => (
                <div className="tw-stat" key={s.label}>
                  <span className="tw-stat-value" data-count={s.n} data-suffix={s.suffix}>
                    0{s.suffix}
                  </span>
                  <span className="tw-stat-label">{s.label}</span>
                </div>
              ))}
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
              <p className="tw-pricing-free-note">
                <strong>Falas për muajin e parë</strong> — pa kartë krediti. Pas trial-it, plane të thjeshta për dyqane të vogla.
              </p>
            </div>
            <div className="tw-pricing-card">
              <div className="tw-pricing-header">
                <h3>Early Access</h3>
                <div className="tw-pricing-price">
                  <span className="tw-pricing-amount">Falas</span>
                  <span className="tw-pricing-period">muajin e parë</span>
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
              <span className="tw-eyebrow">Kontakt</span>
              <h2>Do ta provosh për dyqanin tënd?</h2>
              <p>
                Gati të rritësh angazhimin? Na shkruaj sot dhe zbulo si mund ta
                sjellim vizionin tënd në jetë.
              </p>
            </div>
            <div className="tw-contact-action">
              <a
                className="tw-btn tw-btn--primary"
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
