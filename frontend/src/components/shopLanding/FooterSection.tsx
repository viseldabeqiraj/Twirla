import { Link } from 'react-router-dom';
import type { FooterConfig } from '../../types/ShopLandingConfig';

interface FooterSectionProps {
  footer: FooterConfig;
  shopSlug: string;
}

export default function FooterSection({ footer }: FooterSectionProps) {
  return (
    <footer className="shop-footer">
      <div className="shop-footer-inner">
        <p className="shop-footer-name">{footer.shopName}</p>
        {footer.copyright && (
          <p className="shop-footer-copyright">{footer.copyright}</p>
        )}
        {footer.contactLine && (
          <p className="shop-footer-contact">{footer.contactLine}</p>
        )}
        <p className="shop-footer-powered">
          <Link to="/">Powered by Twirla</Link>
        </p>
      </div>
    </footer>
  );
}
