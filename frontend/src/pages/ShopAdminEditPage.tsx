import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  getShopFromDatabase,
  updateShopInDatabase,
  type CreateShopResponse,
} from '../api/shopBuilderApi';
import { useSetupSession } from '../hooks/useSetupSession';
import { clearShopCatalogCache } from '../data/shopCatalog';
import type { ShopConfig } from '../types/ShopConfig';
import { parseShopConfigJson } from '../utils/shopConfigImages';
import ShopConfigImagePanel from '../components/setup/ShopConfigImagePanel';
import './ShopCampaignSetupPage.css';
import './ShopAdminListPage.css';

export default function ShopAdminEditPage() {
  const { shopId: shopIdParam } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { ready, sessionToken } = useSetupSession();
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CreateShopResponse | null>(null);
  const [meta, setMeta] = useState<{ slug?: string; name?: string; adminToken?: string }>({});

  const loadShop = useCallback(async () => {
    if (!shopIdParam || !sessionToken) return;
    setLoading(true);
    setError(null);
    try {
      const shop = await getShopFromDatabase(shopIdParam, sessionToken);
      setJson(JSON.stringify(shop, null, 2));
      setMeta({
        slug: shop.slug,
        name: shop.name ?? shop.branding?.brandName,
        adminToken: shop.adminToken,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        navigate('/setup/shop-builder', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not load shop.');
    } finally {
      setLoading(false);
    }
  }, [shopIdParam, sessionToken, navigate]);

  useEffect(() => {
    if (ready && sessionToken) loadShop();
  }, [ready, sessionToken, loadShop]);

  const handleFormat = () => {
    try {
      setJson(JSON.stringify(JSON.parse(json) as ShopConfig, null, 2));
      setError(null);
    } catch {
      setError('JSON is invalid — fix syntax before formatting.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopIdParam || !sessionToken) return;
    setError(null);
    setMessage(null);
    setResult(null);

    let config: ShopConfig;
    try {
      config = JSON.parse(json) as ShopConfig;
    } catch {
      setError('Invalid JSON. Check brackets and commas.');
      return;
    }

    if (config.shopId && config.shopId !== shopIdParam) {
      setError('shopId in JSON must match the URL. Change shop ID via duplicate flow, not edit URL.');
      return;
    }
    config.shopId = shopIdParam;

    const payload = { ...config };
    if (!payload.adminToken?.trim()) {
      delete payload.adminToken;
    }

    setSubmitting(true);
    try {
      const res = await updateShopInDatabase(shopIdParam, payload, sessionToken);
      clearShopCatalogCache();
      setResult(res);
      setJson(JSON.stringify(res.shop, null, 2));
      setMeta({
        slug: res.shop.slug,
        name: res.shop.name ?? res.shop.branding?.brandName,
        adminToken: res.adminToken,
      });
      setMessage('Shop saved to database.');
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        navigate('/setup/shop-builder', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="campaign-setup">
        <p className="campaign-setup-loading">Verifying session…</p>
      </div>
    );
  }

  const draftConfig = parseShopConfigJson(json);

  return (
    <div className="shop-admin-list campaign-setup">
      <header className="shop-admin-list-header">
        <p className="campaign-setup-hint">
          <Link to="/setup/shops">← All shops</Link>
        </p>
        <h1 className="shop-admin-list-title">
          {meta.name || meta.slug || shopIdParam}
        </h1>
        <p className="shop-admin-list-lead">
          Edit full <code>ShopConfig</code> JSON. Omit <code>adminToken</code> on save to keep the current token.
        </p>
        <LanguageSwitcher />
      </header>

      {loading ? <p className="campaign-setup-loading">Loading shop…</p> : null}

      {!loading && !error ? (
        <form className="campaign-setup-form" onSubmit={handleSave}>
          <div className="campaign-setup-actions">
            {meta.slug ? (
              <Link className="campaign-setup-btn link" to={`/shop/${meta.slug}`} target="_blank" rel="noreferrer">
                Open landing
              </Link>
            ) : null}
            {meta.slug && meta.adminToken ? (
              <Link
                className="campaign-setup-btn link"
                to={`/admin/${meta.slug}?token=${encodeURIComponent(meta.adminToken)}`}
                target="_blank"
                rel="noreferrer"
              >
                Analytics admin
              </Link>
            ) : null}
            <button type="button" className="campaign-setup-btn" onClick={handleFormat}>
              Format JSON
            </button>
            <button type="button" className="campaign-setup-btn" onClick={() => loadShop()}>
              Reload from DB
            </button>
          </div>

          {draftConfig && sessionToken && (meta.slug || draftConfig.slug) ? (
            <ShopConfigImagePanel
              shopSlug={(meta.slug ?? draftConfig.slug ?? shopIdParam ?? 'shop').trim()}
              sessionToken={sessionToken}
              config={draftConfig}
              onConfigChange={(c: ShopConfig) => setJson(JSON.stringify(c, null, 2))}
            />
          ) : json.trim() ? (
            <p className="campaign-setup-hint">Fix JSON syntax to enable image uploads.</p>
          ) : null}

          <label className="campaign-setup-label">
            Shop configuration
            <textarea
              className="campaign-setup-textarea campaign-setup-textarea--code"
              rows={28}
              value={json}
              onChange={(e) => setJson(e.target.value)}
              spellCheck={false}
            />
          </label>

          {message ? <p className="campaign-setup-msg ok">{message}</p> : null}
          {error ? <p className="campaign-setup-msg err">{error}</p> : null}

          <button type="submit" className="campaign-setup-btn primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save to database'}
          </button>
        </form>
      ) : null}

      {error && !loading ? <p className="campaign-setup-msg err">{error}</p> : null}

      {result ? (
        <section className="campaign-setup-success" aria-live="polite">
          <h2 className="campaign-setup-success-title">Saved</h2>
          <label className="campaign-setup-label">
            Landing
            <input className="campaign-setup-input" readOnly value={result.landingUrl} onFocus={(e) => e.target.select()} />
          </label>
          <label className="campaign-setup-label">
            Admin dashboard
            <input className="campaign-setup-input" readOnly value={result.adminUrl} onFocus={(e) => e.target.select()} />
          </label>
          <label className="campaign-setup-label">
            Admin token
            <input className="campaign-setup-input" readOnly value={result.adminToken} onFocus={(e) => e.target.select()} />
          </label>
        </section>
      ) : null}
    </div>
  );
}
