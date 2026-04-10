import { useTranslation } from '../../i18n/i18n';
import type { HowToOrderConfig } from '../../types/ShopLandingConfig';

interface HowToOrderSectionProps {
  howToOrder: HowToOrderConfig;
}

export default function HowToOrderSection({ howToOrder }: HowToOrderSectionProps) {
  const { t } = useTranslation();
  const body = howToOrder.body?.trim();
  if (!body) return null;

  const heading = howToOrder.heading?.trim() || t('landing.howToOrderTitle');

  return (
    <section className="shop-section shop-how-order" aria-labelledby="shop-how-order-heading">
      <div className="shop-section-inner">
        <h2 id="shop-how-order-heading" className="shop-section-title">
          {heading}
        </h2>
        <p className="shop-how-order-body">{body}</p>
        {howToOrder.primaryCtaLabel && howToOrder.primaryCtaUrl && (
          <a
            href={howToOrder.primaryCtaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shop-how-order-cta"
          >
            {howToOrder.primaryCtaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
