import type { FeaturedProductConfig } from '../../types/ShopLandingConfig';

interface FeaturedProductsProps {
  products: FeaturedProductConfig[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="shop-section shop-products">
      <div className="shop-section-inner">
        <h2 className="shop-section-title">Featured</h2>
        <div className="shop-products-grid">
          {products.map((p) => (
            <article key={p.id} className="shop-product-card">
              {p.imageUrl && (
                <div className="shop-product-image-wrap">
                  <img src={p.imageUrl} alt={p.title} className="shop-product-image" />
                </div>
              )}
              {!p.imageUrl && <div className="shop-product-placeholder" />}
              <div className="shop-product-body">
                <h3 className="shop-product-title">{p.title}</h3>
                {p.description && (
                  <p className="shop-product-desc">{p.description}</p>
                )}
                {p.price && (
                  <p className="shop-product-price">{p.price}</p>
                )}
                {p.ctaLabel && p.ctaUrl && (
                  <a
                    href={p.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shop-product-cta"
                  >
                    {p.ctaLabel}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
