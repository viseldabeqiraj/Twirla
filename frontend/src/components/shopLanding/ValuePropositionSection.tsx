import type { ValuePropositionConfig } from '../../types/ShopLandingConfig';

interface ValuePropositionSectionProps {
  value: ValuePropositionConfig;
}

export default function ValuePropositionSection({ value }: ValuePropositionSectionProps) {
  if (!value.headline?.trim() && !value.body?.trim()) return null;

  return (
    <section className="shop-section shop-value-prop" aria-labelledby="shop-value-prop-heading">
      <div className="shop-section-inner">
        {value.headline?.trim() && (
          <h2 id="shop-value-prop-heading" className="shop-section-title shop-value-prop-title">
            {value.headline.trim()}
          </h2>
        )}
        {value.body?.trim() && (
          <p className="shop-section-subtitle shop-value-prop-body">{value.body.trim()}</p>
        )}
      </div>
    </section>
  );
}
