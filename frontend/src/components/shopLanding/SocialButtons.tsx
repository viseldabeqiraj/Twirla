import { useTranslation } from '../../i18n/i18n';
import type { SocialLinksConfig } from '../../types/ShopLandingConfig';

interface SocialButtonsProps {
  social: SocialLinksConfig;
}

const LINKS = [
  { key: 'instagram' as const, labelKey: 'social.instagram', emoji: '📷', baseUrl: 'https://instagram.com/' },
  { key: 'tiktok' as const, labelKey: 'social.tiktok', emoji: '🎵', baseUrl: 'https://tiktok.com/@' },
  { key: 'whatsapp' as const, labelKey: 'social.whatsapp', emoji: '💬', baseUrl: 'https://wa.me/' },
  { key: 'website' as const, labelKey: 'social.website', emoji: '🌐', baseUrl: '' },
  { key: 'phone' as const, labelKey: 'social.call', emoji: '📞', baseUrl: 'tel:' },
  { key: 'email' as const, labelKey: 'social.email', emoji: '✉️', baseUrl: 'mailto:' },
] as const;

export default function SocialButtons({ social }: SocialButtonsProps) {
  const { t } = useTranslation();
  const items = LINKS.filter(({ key }) => {
    const value = social[key];
    if (!value) return false;
    if (key === 'website' || key === 'phone' || key === 'email') return true;
    return value.startsWith('http') || value.length > 0;
  }).map(({ key, labelKey, emoji, baseUrl }) => {
    const value = social[key];
    const href =
      key === 'website' ? value : key === 'phone' ? `tel:${value}` : key === 'email' ? `mailto:${value}` : value?.startsWith('http') ? value : `${baseUrl}${value}`;
    return { key, label: t(labelKey), emoji, href };
  });

  if (items.length === 0) return null;

  return (
    <section className="shop-section shop-social">
      <div className="shop-section-inner">
        <div className="shop-social-buttons">
          {items.map(({ key, label, emoji, href }) => (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-social-btn"
              aria-label={label}
            >
              <span className="shop-social-emoji">{emoji}</span>
              <span className="shop-social-label">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
