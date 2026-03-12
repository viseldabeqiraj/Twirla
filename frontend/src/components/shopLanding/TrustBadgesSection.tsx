import { useTranslation } from '../../i18n/i18n';
import type { TrustBadgeConfig } from '../../types/ShopLandingConfig';

interface TrustBadgesSectionProps {
  trustBadges: TrustBadgeConfig[];
}

export default function TrustBadgesSection({ trustBadges }: TrustBadgesSectionProps) {
  const { t } = useTranslation();
  if (!trustBadges?.length) return null;
  return (
    <section className="shop-section shop-trust-badges" aria-labelledby="trust-badges-title">
      <div className="shop-section-inner">
        <h2 id="trust-badges-title" className="shop-section-title">
          {t('landing.trustBadgesTitle')}
        </h2>
        <ul className="shop-trust-badges-list">
          {trustBadges.map((item, i) => (
            <li key={i} className="shop-trust-badge">
              {item.icon && <span className="shop-trust-badge-icon" aria-hidden>{item.icon}</span>}
              <span className="shop-trust-badge-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
