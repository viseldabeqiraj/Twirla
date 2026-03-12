import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/i18n';
import { resolveAssetUrl } from '../../config/api';
import type { FooterConfig } from '../../types/ShopLandingConfig';

interface FooterSectionProps {
  footer: FooterConfig;
  shopSlug: string;
}

export default function FooterSection({ footer }: FooterSectionProps) {
  const { t } = useTranslation();
  return (
    <footer className="shop-footer shop-footer-sticky" role="contentinfo">
      <div className="shop-footer-inner">
        <p className="shop-footer-name">{footer.shopName}</p>
        {footer.copyright && (
          <p className="shop-footer-copyright">{footer.copyright}</p>
        )}
        {footer.contactLine && (
          <p className="shop-footer-contact">{footer.contactLine}</p>
        )}
        <div className="shop-footer-twirla">
          <Link to="/" className="shop-footer-twirla-brand" aria-label={t('landing.goToTwirla')}>
            <img src={resolveAssetUrl('/logos/twirla.png')} alt="" className="shop-footer-twirla-logo" />
            <span className="shop-footer-twirla-name">Twirla</span>
          </Link>
          <span className="shop-footer-twirla-powered">{t('landing.poweredByTwirla')}</span>
        </div>
      </div>
    </footer>
  );
}
