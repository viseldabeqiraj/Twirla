import { useTranslation } from '../../i18n/i18n';
import type { AboutConfig, SocialLinksConfig } from '../../types/ShopLandingConfig';

interface ContactSectionProps {
  social: SocialLinksConfig;
  about?: AboutConfig | null;
}

type ContactItem = { key: string; label: string; href: string; emoji: string; sublabel?: string };

function buildContactItems(social: SocialLinksConfig, t: (k: string) => string): ContactItem[] {
  const items: ContactItem[] = [];

  const wa = social.whatsapp;
  if (wa) {
    const href =
      wa.startsWith('http') ? wa : `https://wa.me/${wa.replace(/\D/g, '')}`;
    items.push({ key: 'wa', label: t('social.whatsapp'), href, emoji: '💬', sublabel: t('landing.contactOrderHint') });
  }

  const ig = social.instagram;
  if (ig) {
    const href = ig.startsWith('http') ? ig : `https://instagram.com/${ig.replace(/^@/, '')}`;
    items.push({ key: 'ig', label: t('social.instagram'), href, emoji: '📷', sublabel: t('landing.contactDmHint') });
  }

  if (social.email) {
    items.push({
      key: 'email',
      label: t('social.email'),
      href: `mailto:${social.email}`,
      emoji: '✉️',
    });
  }

  if (social.phone) {
    items.push({
      key: 'phone',
      label: t('social.call'),
      href: `tel:${social.phone.replace(/\s/g, '')}`,
      emoji: '📞',
    });
  }

  if (social.website) {
    items.push({
      key: 'web',
      label: t('social.website'),
      href: social.website.startsWith('http') ? social.website : `https://${social.website}`,
      emoji: '🌐',
    });
  }

  const tt = social.tiktok;
  if (tt) {
    const href = tt.startsWith('http') ? tt : `https://tiktok.com/@${tt.replace(/^@/, '')}`;
    items.push({ key: 'tt', label: t('social.tiktok'), href, emoji: '🎵' });
  }

  return items;
}

export default function ContactSection({ social, about }: ContactSectionProps) {
  const { t } = useTranslation();
  const items = buildContactItems(social, t);
  const address = about?.physicalAddress?.trim();

  if (items.length === 0 && !address) return null;

  return (
    <section className="shop-section shop-contact" aria-labelledby="shop-contact-heading">
      <div className="shop-section-inner">
        <h2 id="shop-contact-heading" className="shop-section-title">
          {t('landing.contactTitle')}
        </h2>
        <p className="shop-contact-intro">{t('landing.contactIntro')}</p>
        {items.length > 0 && (
          <ul className="shop-contact-grid">
            {items.map((item) => (
              <li key={item.key}>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="shop-contact-card">
                  <span className="shop-contact-emoji" aria-hidden>{item.emoji}</span>
                  <span className="shop-contact-label">{item.label}</span>
                  {item.sublabel && <span className="shop-contact-sublabel">{item.sublabel}</span>}
                </a>
              </li>
            ))}
          </ul>
        )}
        {address && (
          <div className="shop-contact-address">
            <span className="shop-contact-address-label">{t('landing.contactAddress')}</span>
            <p className="shop-contact-address-text">{address}</p>
            {(about?.city || about?.country) && (
              <p className="shop-contact-address-meta">
                {[about.city, about.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
