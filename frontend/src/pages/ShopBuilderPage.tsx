import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { CAMPAIGN_SETUP_TOKEN_KEY, validateCampaignSetupSession } from '../api/campaignSetupApi';
import { createShopInDatabase, updateShopInDatabase, type CreateShopResponse } from '../api/shopBuilderApi';
import { clearShopCatalogCache } from '../data/shopCatalog';
import {
  buildShopConfigFromForm,
  generateShopId,
  randomToken,
  slugify,
} from '../utils/shopConfigDefaults';
import './ShopCampaignSetupPage.css';

export default function ShopBuilderPage() {
  const navigate = useNavigate();
  const [sessionAuth, setSessionAuth] = useState<'pending' | 'ok' | 'fail'>('pending');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shopId, setShopId] = useState('');
  const [adminToken, setAdminToken] = useState(() => randomToken(32));
  const [primaryColor, setPrimaryColor] = useState('#db2777');
  const [secondaryColor, setSecondaryColor] = useState('#be185d');
  const [logoUrl, setLogoUrl] = useState('');
  const [ctaUrl, setCtaUrl] = useState('https://instagram.com/');
  const [title, setTitle] = useState('Play to win!');
  const [subtitle, setSubtitle] = useState('Try your luck');
  const [experienceSlug, setExperienceSlug] = useState('');
  const [experienceUniqueId, setExperienceUniqueId] = useState('');
  const [enableWheel, setEnableWheel] = useState(true);
  const [enableTapHearts, setEnableTapHearts] = useState(false);
  const [enableScratch, setEnableScratch] = useState(false);
  const [enableCountdown, setEnableCountdown] = useState(false);
  const [enableMemory, setEnableMemory] = useState(false);
  const [enableRunner, setEnableRunner] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [advancedJson, setAdvancedJson] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateShopResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let token: string | null = null;
      try {
        token = sessionStorage.getItem(CAMPAIGN_SETUP_TOKEN_KEY);
      } catch {
        /* ignore */
      }
      if (!token) {
        if (!cancelled) setSessionAuth('fail');
        return;
      }
      const ok = await validateCampaignSetupSession(token);
      if (!cancelled) setSessionAuth(ok ? 'ok' : 'fail');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (sessionAuth === 'fail') {
      navigate('/setup/shop-builder', { replace: true });
    }
  }, [sessionAuth, navigate]);

  const onNameChange = (value: string) => {
    setName(value);
    setSlug((prev) => (prev.trim() ? prev : slugify(value)));
    setShopId((prev) => (prev.trim() ? prev : generateShopId(value)));
    setExperienceSlug((prev) => (prev.trim() ? prev : slugify(value)));
  };

  const regenerateShopId = () => setShopId(generateShopId(name || slug || 'shop'));
  const regenerateToken = () => setAdminToken(randomToken(32));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!slug.trim()) {
      setError('URL slug is required.');
      return;
    }
    if (!shopId.trim()) {
      setError('Shop ID is required.');
      return;
    }

    let token: string | null = null;
    try {
      token = sessionStorage.getItem(CAMPAIGN_SETUP_TOKEN_KEY);
    } catch {
      /* ignore */
    }
    if (!token) {
      navigate('/setup/shop-builder', { replace: true });
      return;
    }

    let config;
    try {
      config = buildShopConfigFromForm({
        name,
        slug: slug.trim(),
        shopId: shopId.trim(),
        adminToken,
        primaryColor,
        secondaryColor,
        logoUrl,
        ctaUrl,
        title,
        subtitle,
        experienceSlug: experienceSlug.trim() || slug.trim(),
        experienceUniqueId: experienceUniqueId.trim(),
        enableWheel,
        enableTapHearts,
        enableScratch,
        enableCountdown,
        enableMemory,
        enableRunner,
        advancedJson: showAdvanced ? advancedJson : undefined,
      });
    } catch {
      setError('Advanced JSON is invalid. Fix the JSON or turn off advanced mode.');
      return;
    }

    setSubmitting(true);
    try {
      const isUpdate = updateExisting && showAdvanced && config.shopId?.trim();
      const payload = { ...config };
      if (isUpdate && payload.adminToken?.includes('REPLACE')) {
        delete payload.adminToken;
      }
      const res = isUpdate
        ? await updateShopInDatabase(config.shopId.trim(), payload, token)
        : await createShopInDatabase(config, token);
      clearShopCatalogCache();
      setResult(res);
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        navigate('/setup/shop-builder', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not save shop.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionAuth === 'pending') {
    return (
      <div className="campaign-setup">
        <p className="campaign-setup-loading">Verifying session…</p>
      </div>
    );
  }

  if (sessionAuth !== 'ok') {
    return null;
  }

  return (
    <div className="campaign-setup">
      <header className="campaign-setup-header">
        <h1 className="campaign-setup-title">New shop → database</h1>
        <p className="campaign-setup-lead">
          Creates a full shop row in SQLite. After save you get the admin token and all public URLs.
        </p>
        <LanguageSwitcher />
        <p className="campaign-setup-hint">
          <Link to="/setup/shops">← All shops</Link>
        </p>
      </header>

      {result ? (
        <section className="campaign-setup-success" aria-live="polite">
          <h2 className="campaign-setup-success-title">Shop created</h2>
          <p className="campaign-setup-success-lead">
            Copy these links. The admin token is only shown here once (also stored in the database).
          </p>
          <label className="campaign-setup-label">
            Admin token
            <input className="campaign-setup-input" readOnly value={result.adminToken} onFocus={(e) => e.target.select()} />
          </label>
          <label className="campaign-setup-label">
            Shop ID
            <input className="campaign-setup-input" readOnly value={result.shop.shopId} onFocus={(e) => e.target.select()} />
          </label>
          <label className="campaign-setup-label">
            Landing page
            <input className="campaign-setup-input" readOnly value={result.landingUrl} onFocus={(e) => e.target.select()} />
          </label>
          <label className="campaign-setup-label">
            Admin dashboard
            <input className="campaign-setup-input" readOnly value={result.adminUrl} onFocus={(e) => e.target.select()} />
          </label>
          <label className="campaign-setup-label">
            Game path shop ID ({'{slug}-{id}'})
            <input
              className="campaign-setup-input"
              readOnly
              value={result.experiencePathShopId}
              onFocus={(e) => e.target.select()}
            />
          </label>
          {result.gameUrls.length > 0 ? (
            <>
              <p className="campaign-setup-hint">Game URLs (one per enabled mode):</p>
              {result.gameUrls.map((g) => (
                <label key={g.mode} className="campaign-setup-label">
                  {g.mode}
                  <input className="campaign-setup-input" readOnly value={g.url} onFocus={(e) => e.target.select()} />
                </label>
              ))}
            </>
          ) : (
            <p className="campaign-setup-hint">No game modes were enabled on this shop.</p>
          )}
          <div className="campaign-setup-actions">
            <Link className="campaign-setup-btn link" to={`/shop/${result.shop.slug}`}>
              Open landing
            </Link>
            <Link className="campaign-setup-btn link" to={`/admin/${result.shop.slug}?token=${encodeURIComponent(result.adminToken)}`}>
              Open admin
            </Link>
            <button
              type="button"
              className="campaign-setup-btn"
              onClick={() => {
                setResult(null);
                setName('');
                setSlug('');
                setShopId('');
                setAdminToken(randomToken(32));
              }}
            >
              Add another shop
            </button>
          </div>
        </section>
      ) : (
        <form className="campaign-setup-form" onSubmit={handleSubmit}>
          <fieldset className="campaign-setup-fieldset">
            <legend className="campaign-setup-legend">Basics</legend>
            <label className="campaign-setup-label">
              Display name
              <input
                className="campaign-setup-input"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="My Boutique"
              />
            </label>
            <label className="campaign-setup-label">
              URL slug (/shop/…)
              <input
                className="campaign-setup-input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-boutique"
              />
            </label>
            <label className="campaign-setup-label">
              Shop ID (Twirla internal)
              <div className="campaign-setup-row">
                <input className="campaign-setup-input" value={shopId} onChange={(e) => setShopId(e.target.value)} />
                <button type="button" className="campaign-setup-btn" onClick={regenerateShopId}>
                  Regenerate
                </button>
              </div>
            </label>
            <label className="campaign-setup-label">
              Admin token
              <div className="campaign-setup-row">
                <input className="campaign-setup-input" value={adminToken} onChange={(e) => setAdminToken(e.target.value)} />
                <button type="button" className="campaign-setup-btn" onClick={regenerateToken}>
                  Regenerate
                </button>
              </div>
            </label>
          </fieldset>

          <fieldset className="campaign-setup-fieldset">
            <legend className="campaign-setup-legend">Branding & copy</legend>
            <label className="campaign-setup-label">
              Primary color
              <input className="campaign-setup-input" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
            </label>
            <label className="campaign-setup-label">
              Secondary color
              <input className="campaign-setup-input" type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
            </label>
            <label className="campaign-setup-label">
              Logo URL (optional)
              <input className="campaign-setup-input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="/logos/my-logo.png" />
            </label>
            <label className="campaign-setup-label">
              Experience title
              <input className="campaign-setup-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="campaign-setup-label">
              Subtitle
              <input className="campaign-setup-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </label>
            <label className="campaign-setup-label">
              CTA / Instagram URL
              <input className="campaign-setup-input" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
            </label>
          </fieldset>

          <fieldset className="campaign-setup-fieldset">
            <legend className="campaign-setup-legend">Game URL path</legend>
            <p className="campaign-setup-hint">
              Games load at /{'{mode}'}/{'{slug}'}/{'{id}'} — defaults match your shop slug and shop ID suffix.
            </p>
            <label className="campaign-setup-label">
              Experience slug segment
              <input
                className="campaign-setup-input"
                value={experienceSlug}
                onChange={(e) => setExperienceSlug(e.target.value)}
                placeholder={slug || 'same as URL slug'}
              />
            </label>
            <label className="campaign-setup-label">
              Experience ID segment
              <input
                className="campaign-setup-input"
                value={experienceUniqueId}
                onChange={(e) => setExperienceUniqueId(e.target.value)}
                placeholder="auto from shop ID suffix"
              />
            </label>
          </fieldset>

          <fieldset className="campaign-setup-fieldset">
            <legend className="campaign-setup-legend">Games</legend>
            <label className="campaign-setup-check">
              <input type="checkbox" checked={enableWheel} onChange={(e) => setEnableWheel(e.target.checked)} />
              Prize wheel
            </label>
            <label className="campaign-setup-check">
              <input type="checkbox" checked={enableTapHearts} onChange={(e) => setEnableTapHearts(e.target.checked)} />
              Catch the prize (tap hearts)
            </label>
            <label className="campaign-setup-check">
              <input type="checkbox" checked={enableScratch} onChange={(e) => setEnableScratch(e.target.checked)} />
              Scratch card
            </label>
            <label className="campaign-setup-check">
              <input type="checkbox" checked={enableCountdown} onChange={(e) => setEnableCountdown(e.target.checked)} />
              Countdown
            </label>
            <label className="campaign-setup-check">
              <input type="checkbox" checked={enableMemory} onChange={(e) => setEnableMemory(e.target.checked)} />
              Memory match
            </label>
            <label className="campaign-setup-check">
              <input type="checkbox" checked={enableRunner} onChange={(e) => setEnableRunner(e.target.checked)} />
              Runner
            </label>
          </fieldset>

          <fieldset className="campaign-setup-fieldset">
            <legend className="campaign-setup-legend">Advanced</legend>
            <label className="campaign-setup-check">
              <input type="checkbox" checked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} />
              Override with full ShopConfig JSON (campaign, all game options, translations, etc.)
            </label>
            {showAdvanced ? (
              <label className="campaign-setup-check">
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                />
                Update existing shop (same shopId — keeps admin token if omitted)
              </label>
            ) : null}
            {showAdvanced ? (
              <label className="campaign-setup-label">
                JSON body
                <textarea
                  className="campaign-setup-textarea"
                  rows={16}
                  value={advancedJson}
                  onChange={(e) => setAdvancedJson(e.target.value)}
                  placeholder={'{\n  "shopId": "...",\n  "slug": "...",\n  "wheel": { ... },\n  "campaign": { ... }\n}'}
                />
              </label>
            ) : null}
          </fieldset>

          {error ? <p className="campaign-setup-msg err">{error}</p> : null}
          <button type="submit" className="campaign-setup-btn primary" disabled={submitting}>
            {submitting
              ? 'Saving to database…'
              : updateExisting && showAdvanced
                ? 'Update shop in database'
                : 'Create shop in database'}
          </button>
        </form>
      )}
    </div>
  );
}
