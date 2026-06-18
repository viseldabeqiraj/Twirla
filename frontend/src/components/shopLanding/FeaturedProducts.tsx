import { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import AnimatedPrimaryButton from '../twirla-ui/AnimatedPrimaryButton';
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

function resolveProductCta(
  p: FeaturedProductConfig,
  fallbackCta: { url: string; label: string } | null
): { url: string; label: string } | null {
  const ctaUrl = p.ctaUrl?.trim();
  const ctaLabel = p.ctaLabel?.trim();
  if (ctaUrl && ctaLabel) return { url: ctaUrl, label: ctaLabel };
  if (ctaUrl && fallbackCta) return { url: ctaUrl, label: fallbackCta.label };
  if (!ctaUrl && fallbackCta) return fallbackCta;
  return null;
}

function ProductCard({
  product: p,
  fallbackCta,
}: {
  product: FeaturedProductConfig;
  fallbackCta: { url: string; label: string } | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = p.imageUrl?.trim() ? resolveAssetUrl(p.imageUrl) : '';
  const showImage = !!src && !imageFailed;
  const resolved = resolveProductCta(p, fallbackCta);

  return (
    <article className="shop-product-card">
      {showImage ? (
        <div className="shop-product-image-wrap">
          <img
            src={src}
            alt={p.title}
            className="shop-product-image"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : (
        <div className="shop-product-placeholder" aria-hidden />
      )}
      <div className="shop-product-body">
        <h3 className="shop-product-title">{p.title}</h3>
        {p.description ? <p className="shop-product-desc">{p.description}</p> : null}
        {p.price ? <p className="shop-product-price">{p.price}</p> : null}
        {resolved ? (
          <AnimatedPrimaryButton
            href={resolved.url}
            external
            pulse
            small
            className="shop-product-cta"
          >
            {resolved.label}
          </AnimatedPrimaryButton>
        ) : null}
      </div>
    </article>
  );
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
            {products.map((p) => (
              <ProductCard key={p.id} product={p} fallbackCta={fallbackCta} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
