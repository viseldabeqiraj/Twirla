import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { CAMPAIGN_SETUP_TOKEN_KEY, unlockCampaignSetup } from '../api/campaignSetupApi';
import { useTranslation } from '../i18n/i18n';
import './ShopCampaignSetupPage.css';

export default function CampaignSetupGatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await unlockCampaignSetup(code);
      try {
        sessionStorage.setItem(CAMPAIGN_SETUP_TOKEN_KEY, token);
      } catch {
        /* ignore */
      }
      navigate('/setup/campaign/form', { replace: true });
    } catch (err) {
      const key =
        err instanceof Error && err.message === 'NOT_CONFIGURED'
          ? 'campaignSetup.accessNotConfigured'
          : 'campaignSetup.accessWrong';
      setError(t(key));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-setup">
      <header className="campaign-setup-header">
        <h1 className="campaign-setup-title">{t('campaignSetup.accessTitle')}</h1>
        <p className="campaign-setup-lead">{t('campaignSetup.accessLead')}</p>
        <LanguageSwitcher />
      </header>
      <form className="campaign-setup-form" onSubmit={handleSubmit}>
        <label className="campaign-setup-label">
          {t('campaignSetup.accessCodeLabel')}
          <input
            className="campaign-setup-input"
            type="password"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('campaignSetup.accessCodePlaceholder')}
            disabled={loading}
          />
        </label>
        {error ? <p className="campaign-setup-msg err">{error}</p> : null}
        <button type="submit" className="campaign-setup-btn primary" disabled={loading}>
          {loading ? t('campaignSetup.accessVerifying') : t('campaignSetup.accessSubmit')}
        </button>
      </form>
    </div>
  );
}
