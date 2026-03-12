import { useTranslation } from '../i18n/i18n';
import { resolveAssetUrl } from '../config/api';
import './TwirlaFooter.css';

/**
 * Sticky footer for Twirla branding. Rendered in-app (no portal) so it is
 * reliably visible on mobile and desktop, fixed to viewport bottom.
 */
export default function TwirlaFooter() {
  const { t } = useTranslation();
  return (
    <footer className="twirla-footer-fixed" role="contentinfo">
      <a href="/" className="twirla-footer-fixed-brand" aria-label={t('landing.goToTwirla')}>
        <img src={resolveAssetUrl('/logos/twirla.png')} alt="" className="twirla-footer-fixed-logo" />
        <span className="twirla-footer-fixed-name">Twirla</span>
      </a>
      <span className="twirla-footer-fixed-powered">{t('landing.poweredByTwirla')}</span>
    </footer>
  );
}
