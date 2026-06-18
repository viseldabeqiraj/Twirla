import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { CAMPAIGN_SETUP_TOKEN_KEY, unlockCampaignSetup } from '../api/campaignSetupApi';
import './ShopCampaignSetupPage.css';

export default function ShopBuilderGatePage() {
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
      navigate('/setup/shops', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'NOT_CONFIGURED'
          ? 'Shop builder is not configured on the server (CampaignSetup:AccessCode).'
          : 'Wrong access code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-setup">
      <header className="campaign-setup-header">
        <h1 className="campaign-setup-title">Add shop to database</h1>
        <p className="campaign-setup-lead">
          Enter the same internal access code used for campaign setup. New shops are saved directly to SQLite.
        </p>
        <LanguageSwitcher />
      </header>
      <form className="campaign-setup-form" onSubmit={handleSubmit}>
        <label className="campaign-setup-label">
          Access code
          <input
            className="campaign-setup-input"
            type="password"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
        </label>
        {error ? <p className="campaign-setup-msg err">{error}</p> : null}
        <button type="submit" className="campaign-setup-btn primary" disabled={loading}>
          {loading ? 'Verifying…' : 'Continue'}
        </button>
        <p className="campaign-setup-hint">
          Already unlocked? <Link to="/setup/shops">All shops</Link>
          {' · '}
          <Link to="/setup/shop-builder/form">New shop</Link>
        </p>
      </form>
    </div>
  );
}
