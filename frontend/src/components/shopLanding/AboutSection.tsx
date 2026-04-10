import { useTranslation } from '../../i18n/i18n';
import { resolveAssetUrl } from '../../config/api';
import type { AboutConfig } from '../../types/ShopLandingConfig';

interface AboutSectionProps {
  about?: AboutConfig | null;
}

export default function AboutSection({ about }: AboutSectionProps) {
  const { t } = useTranslation();
  const hasText = !!(about?.whatWeSell?.trim() || about?.aboutUs?.trim());
  const hasPhoto = !!about?.ownerPhotoUrl?.trim();
  if (!about || (!hasText && !hasPhoto)) return null;

  return (
    <section className="shop-section shop-about" aria-labelledby="shop-about-heading">
      <div className="shop-section-inner">
        <h2 id="shop-about-heading" className="shop-section-title shop-about-heading">
          {t('landing.aboutTitle')}
        </h2>
        {hasPhoto && (
          <div className="shop-about-photo-wrap">
            <img
              src={resolveAssetUrl(about.ownerPhotoUrl!.trim())}
              alt=""
              className="shop-about-photo"
            />
          </div>
        )}
        {about.whatWeSell?.trim() && (
          <p className="shop-about-tagline">{about.whatWeSell.trim()}</p>
        )}
        {about.aboutUs?.trim() && (
          <p className="shop-about-text">{about.aboutUs.trim()}</p>
        )}
        {(about.city || about.country) && (
          <p className="shop-about-location">
            {[about.city, about.country].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
    </section>
  );
}
