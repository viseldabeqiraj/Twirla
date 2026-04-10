import { useTranslation } from '../../i18n/i18n';
import { resolveAssetUrl } from '../../config/api';
import type { FeaturedProductConfig, SocialLinksConfig } from '../../types/ShopLandingConfig';

interface FeaturedProductsProps {
  products: FeaturedProductConfig[];
  /** Optional custom section title (e.g. "Featured", "Best sellers") */
  sectionTitle?: string;
  /** Used to infer a default "DM / order" link when a product has no CTA */
  social?: SocialLinksConfig;
}

function defaultOrderCta(
  social: SocialLinksConfig | undefined,
  t: (key: string) => string
): { url: string; label: string } | null {
  if (!social) return null;
  const wa = social.whatsapp;
  if (wa) {
    const url = wa.startsWith('http') ? wa : `https://wa.me/${wa.replace(/\D/g, '')}`;
    return { url, label: t('landing.productCtaWhatsApp') };
  }
  const ig = social.instagram;
  if (ig) {
    const url = ig.startsWith('http') ? ig : `https://instagram.com/${ig.replace(/^@/, '')}`;
    return { url, label: t('landing.productCtaDm') };
  }
  const web = social.website;
  if (web) {
    const url = web.startsWith('http') ? web : `https://${web}`;
    return { url, label: t('landing.productCtaShop') };
  }
  return null;
}

export default function FeaturedProducts({ products, sectionTitle, social }: FeaturedProductsProps) {
  const { t } = useTranslation();
  if (products.length === 0) return null;

  const fallbackCta = defaultOrderCta(social, t);
  const title = sectionTitle?.trim() || t('landing.featuredSectionDefault');

  return (
    <section className="shop-section shop-products" aria-labelledby="shop-products-heading">
      <div className="shop-section-inner">
        <h2 id="shop-products-heading" className="shop-section-title">{title}</h2>
        <p className="shop-section-subtitle shop-products-subtitle">{t('landing.featuredProductsSubtitle')}</p>
        <div className="shop-products-showcase">
          <div className="shop-products-grid">
            {products.map((p) => {
              const ctaUrl = p.ctaUrl?.trim();
              const ctaLabel = p.ctaLabel?.trim();
              const resolved =
                ctaUrl && ctaLabel
                  ? { url: ctaUrl, label: ctaLabel }
                  : ctaUrl && fallbackCta
                    ? { url: ctaUrl, label: fallbackCta.label }
                    : !ctaUrl && fallbackCta
                      ? fallbackCta
                      : null;

              return (
                <article key={p.id} className="shop-product-card">
                  {p.imageUrl && (
                    <div className="shop-product-image-wrap">
                      <img
                        src={resolveAssetUrl(p.imageUrl)}
                        alt={p.title}
                        className="shop-product-image"
                      />
                    </div>
                  )}
                  {!p.imageUrl && <div className="shop-product-placeholder" aria-hidden />}
                  <div className="shop-product-body">
                    <h3 className="shop-product-title">{p.title}</h3>
                    {p.description && (
                      <p className="shop-product-desc">{p.description}</p>
                    )}
                    {p.price && (
                      <p className="shop-product-price">{p.price}</p>
                    )}
                    {resolved && (
                      <a
                        href={resolved.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shop-product-cta"
                      >
                        {resolved.label}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
