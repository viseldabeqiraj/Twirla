import type { AboutConfig } from '../../types/ShopLandingConfig';

interface AboutSectionProps {
  about?: AboutConfig | null;
}

export default function AboutSection({ about }: AboutSectionProps) {
  if (!about || (!about.whatWeSell && !about.aboutUs)) return null;

  return (
    <section className="shop-section shop-about">
      <div className="shop-section-inner">
        {about.whatWeSell && (
          <p className="shop-about-tagline">{about.whatWeSell}</p>
        )}
        {about.aboutUs && (
          <p className="shop-about-text">{about.aboutUs}</p>
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
