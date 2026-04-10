import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  CAMPAIGN_LANDING_STORAGE_KEY,
  CAMPAIGN_PREVIEW_SLUG,
  CAMPAIGN_PREVIEW_TEMPLATE_SLUG,
} from '../data/shopLandingPlaceholder';
import { shopConfigToLandingConfig } from '../data/shopConfigToLanding';
import { fetchShopsFromJson, findEnabledShopByUrlSlug, isShopEnabled } from '../data/shopsJson';
import { useTranslation } from '../i18n/i18n';
import type { LandingFontPairId, LandingLayoutTemplate, ShopLandingConfig } from '../types/ShopLandingConfig';
import { PUBLIC_CAMPAIGN_GAMES } from '../types/ShopLandingConfig';
import type { FeaturedProductConfig } from '../types/ShopLandingConfig';
import { ExperienceMode } from '../types/ShopConfig';
import type { ShopConfig } from '../types/ShopConfig';
import { CAMPAIGN_SETUP_TOKEN_KEY, validateCampaignSetupSession } from '../api/campaignSetupApi';
import './ShopCampaignSetupPage.css';

const FONT_OPTIONS: LandingFontPairId[] = ['default', 'editorial', 'modern-tech'];
const LAYOUT_OPTIONS: LandingLayoutTemplate[] = ['product-focused', 'story-driven', 'game-first'];

export type CampaignSaveSummary = {
  landingUrl: string;
  experiencePathShopId: string;
  resolvedTwirlaShopId: string | null;
  sampleGameUrl: string;
};

type ProductRow = {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
};

function emptyProductRow(): ProductRow {
  return {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    ctaLabel: '',
    ctaUrl: '',
  };
}

function productsToRows(products: FeaturedProductConfig[]): ProductRow[] {
  if (products.length === 0) return [emptyProductRow()];
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description ?? '',
    price: p.price ?? '',
    imageUrl: p.imageUrl ?? '',
    ctaLabel: p.ctaLabel ?? '',
    ctaUrl: p.ctaUrl ?? '',
  }));
}

function rowsToFeaturedProducts(rows: ProductRow[]): FeaturedProductConfig[] {
  return rows
    .filter((r) => r.title.trim())
    .map((r) => ({
      id: r.id,
      title: r.title.trim(),
      description: r.description.trim() || undefined,
      price: r.price.trim() || undefined,
      imageUrl: r.imageUrl.trim() || undefined,
      ctaLabel: r.ctaLabel.trim() || undefined,
      ctaUrl: r.ctaUrl.trim() || undefined,
    }));
}

export default function ShopCampaignSetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessionAuth, setSessionAuth] = useState<'pending' | 'ok'>('pending');
  const [ready, setReady] = useState(false);
  const [templateShop, setTemplateShop] = useState<ShopConfig | null>(null);

  const [shopName, setShopName] = useState('');
  const [primary, setPrimary] = useState('#db2777');
  const [secondary, setSecondary] = useState('#be185d');
  const [accent, setAccent] = useState('#fb7185');
  const [fontPairId, setFontPairId] = useState<LandingFontPairId>('default');
  const [layoutTemplate, setLayoutTemplate] = useState<LandingLayoutTemplate>('product-focused');
  const [headline, setHeadline] = useState('');
  const [tagline, setTagline] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [vpHeadline, setVpHeadline] = useState('');
  const [vpBody, setVpBody] = useState('');
  const [howBody, setHowBody] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [experienceSlug, setExperienceSlug] = useState('demo');
  const [experienceUniqueId, setExperienceUniqueId] = useState('main');
  const [productRows, setProductRows] = useState<ProductRow[]>([emptyProductRow()]);
  const [games, setGames] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [saveSummary, setSaveSummary] = useState<CampaignSaveSummary | null>(null);

  const applyLanding = useCallback((landing: ShopLandingConfig) => {
    setShopName(landing.hero.shopName);
    setPrimary(landing.primaryColor ?? landing.hero.primaryColor ?? '#db2777');
    setSecondary(landing.secondaryColor ?? landing.hero.secondaryColor ?? '#be185d');
    setAccent(landing.accentColor ?? '#fb7185');
    setFontPairId(landing.fontPairId ?? 'default');
    setLayoutTemplate(landing.layoutTemplate ?? 'product-focused');
    setHeadline(landing.hero.headline ?? '');
    setTagline(landing.hero.tagline);
    setCtaLabel(landing.hero.cta.label);
    setCtaUrl(landing.hero.cta.url);
    setVpHeadline(landing.valueProposition?.headline ?? '');
    setVpBody(landing.valueProposition?.body ?? '');
    setHowBody(landing.howToOrder?.body ?? '');
    setInstagram(landing.social.instagram ?? '');
    setWhatsapp(landing.social.whatsapp ?? '');
    setWebsite(landing.social.website ?? '');
    setExperienceSlug(landing.experiencePath.shopName);
    setExperienceUniqueId(landing.experiencePath.uniqueId);
    setProductRows(productsToRows(landing.featuredProducts));
    const g: Record<string, boolean> = {};
    for (const m of PUBLIC_CAMPAIGN_GAMES) {
      g[m] = landing.enabledGames.includes(m);
    }
    setGames(g);
  }, []);

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
        navigate('/setup/campaign', { replace: true });
        return;
      }
      const ok = await validateCampaignSetupSession(token);
      if (cancelled) return;
      if (!ok) {
        try {
          sessionStorage.removeItem(CAMPAIGN_SETUP_TOKEN_KEY);
        } catch {
          /* ignore */
        }
        navigate('/setup/campaign', { replace: true });
        return;
      }
      setSessionAuth('ok');
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (sessionAuth !== 'ok') return;
    let cancelled = false;
    (async () => {
      try {
        const shops = await fetchShopsFromJson();
        if (cancelled) return;
        const template =
          findEnabledShopByUrlSlug(CAMPAIGN_PREVIEW_TEMPLATE_SLUG, shops) ??
          findEnabledShopByUrlSlug('demo', shops) ??
          shops.find(isShopEnabled);
        if (!template) {
          setMessage({ type: 'err', text: t('campaignSetup.noShopsJson') });
          setReady(true);
          return;
        }
        setTemplateShop(template);
        const slug = template.slug ?? CAMPAIGN_PREVIEW_TEMPLATE_SLUG;
        const baseLanding = shopConfigToLandingConfig(template, slug);

        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(CAMPAIGN_LANDING_STORAGE_KEY);
          if (raw) {
            try {
              const saved = JSON.parse(raw) as ShopLandingConfig;
              applyLanding(saved);
              setReady(true);
              return;
            } catch {
              /* fall through */
            }
          }
        }
        applyLanding(baseLanding);
        setReady(true);
      } catch {
        if (!cancelled) {
          setMessage({ type: 'err', text: t('campaignSetup.noShopsJson') });
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyLanding, sessionAuth, t]);

  const toggleGame = (mode: ExperienceMode) => {
    setGames((prev) => ({ ...prev, [mode]: !prev[mode] }));
  };

  const updateProductRow = (id: string, patch: Partial<ProductRow>) => {
    setProductRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addProductRow = () => {
    setProductRows((rows) => [...rows, emptyProductRow()]);
  };

  const removeProductRow = (id: string) => {
    setProductRows((rows) => (rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!templateShop) {
      setMessage({ type: 'err', text: t('campaignSetup.noShopsJson') });
      return;
    }

    const featuredProducts = rowsToFeaturedProducts(productRows);
    const enabledGames = PUBLIC_CAMPAIGN_GAMES.filter((m) => games[m] === true);
    if (enabledGames.length === 0) {
      setMessage({ type: 'err', text: t('campaignSetup.oneGameRequired') });
      return;
    }

    const expSlug = experienceSlug.trim() || 'demo';
    const expUid = experienceUniqueId.trim() || 'main';

    const templateSlug = templateShop.slug ?? CAMPAIGN_PREVIEW_TEMPLATE_SLUG;
    const base = shopConfigToLandingConfig(templateShop, templateSlug);
    const landing: ShopLandingConfig = {
      ...base,
      shopSlug: CAMPAIGN_PREVIEW_SLUG,
      layoutTemplate,
      fontPairId,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      hero: {
        ...base.hero,
        shopName,
        headline: headline.trim() || undefined,
        tagline,
        cta: { label: ctaLabel, url: ctaUrl },
        primaryColor: primary,
        secondaryColor: secondary,
      },
      social: {
        instagram: instagram.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        website: website.trim() || undefined,
      },
      valueProposition:
        vpHeadline.trim() || vpBody.trim()
          ? { headline: vpHeadline.trim() || undefined, body: vpBody.trim() || undefined }
          : undefined,
      howToOrder: howBody.trim() ? { body: howBody.trim() } : undefined,
      featuredProducts,
      enabledGames,
      experiencePath: {
        shopName: expSlug,
        uniqueId: expUid,
      },
    };

    localStorage.setItem(CAMPAIGN_LANDING_STORAGE_KEY, JSON.stringify(landing));

    let resolvedTwirlaShopId: string | null = null;
    try {
      const shops = await fetchShopsFromJson();
      const resolved = findEnabledShopByUrlSlug(expSlug, shops);
      resolvedTwirlaShopId = resolved?.shopId ?? null;
    } catch {
      /* ignore */
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setSaveSummary({
      landingUrl: `${origin}/shop/${CAMPAIGN_PREVIEW_SLUG}`,
      experiencePathShopId: `${expSlug}-${expUid}`,
      resolvedTwirlaShopId,
      sampleGameUrl: `${origin}/wheel/${encodeURIComponent(expSlug)}/${encodeURIComponent(expUid)}`,
    });
    setMessage({ type: 'ok', text: t('campaignSetup.saveSuccess') });
  };

  const handleClear = () => {
    localStorage.removeItem(CAMPAIGN_LANDING_STORAGE_KEY);
    setSaveSummary(null);
    setMessage({ type: 'ok', text: t('campaignSetup.cleared') });
    if (templateShop) {
      const slug = templateShop.slug ?? CAMPAIGN_PREVIEW_TEMPLATE_SLUG;
      applyLanding(shopConfigToLandingConfig(templateShop, slug));
    }
  };

  if (sessionAuth === 'pending') {
    return (
      <div className="campaign-setup">
        <p className="campaign-setup-loading">{t('campaignSetup.verifyingSession')}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="campaign-setup">
        <p className="campaign-setup-loading">{t('campaignSetup.loading')}</p>
      </div>
    );
  }

  return (
    <div className="campaign-setup">
      <header className="campaign-setup-header">
        <h1 className="campaign-setup-title">{t('campaignSetup.title')}</h1>
        <p className="campaign-setup-lead">{t('campaignSetup.lead')}</p>
        <LanguageSwitcher />
      </header>

      {saveSummary ? (
        <section className="campaign-setup-success" aria-live="polite">
          <h2 className="campaign-setup-success-title">{t('campaignSetup.saveSummaryTitle')}</h2>
          <p className="campaign-setup-success-lead">{t('campaignSetup.saveSummaryLead')}</p>
          <label className="campaign-setup-label">
            {t('campaignSetup.saveFieldLandingUrl')}
            <input className="campaign-setup-input" readOnly value={saveSummary.landingUrl} onFocus={(e) => e.target.select()} />
          </label>
          <label className="campaign-setup-label">
            {t('campaignSetup.saveFieldGamePathId')}
            <input
              className="campaign-setup-input"
              readOnly
              value={saveSummary.experiencePathShopId}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <label className="campaign-setup-label">
            {t('campaignSetup.saveFieldTwirlaShopId')}
            <input
              className="campaign-setup-input"
              readOnly
              value={saveSummary.resolvedTwirlaShopId ?? ''}
              placeholder={saveSummary.resolvedTwirlaShopId ? undefined : '—'}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <p className="campaign-setup-hint">
            {saveSummary.resolvedTwirlaShopId
              ? t('campaignSetup.saveFieldTwirlaShopIdHint')
              : t('campaignSetup.saveFieldTwirlaShopIdUnknown')}
          </p>
          <label className="campaign-setup-label">
            {t('campaignSetup.saveFieldSampleGame')}
            <input className="campaign-setup-input" readOnly value={saveSummary.sampleGameUrl} onFocus={(e) => e.target.select()} />
          </label>
          <div className="campaign-setup-actions">
            <Link className="campaign-setup-btn link" to={`/shop/${CAMPAIGN_PREVIEW_SLUG}`}>
              {t('campaignSetup.openPreview')}
            </Link>
            <button type="button" className="campaign-setup-btn" onClick={() => setSaveSummary(null)}>
              {t('campaignSetup.dismissSummary')}
            </button>
          </div>
        </section>
      ) : null}

      <form className="campaign-setup-form" onSubmit={handleSubmit}>
        <fieldset className="campaign-setup-fieldset">
          <legend>{t('campaignSetup.sectionPlayLinks')}</legend>
          <p className="campaign-setup-hint">{t('campaignSetup.playLinksHint')}</p>
          <div className="campaign-setup-row campaign-setup-row--grow">
            <label className="campaign-setup-label">
              {t('campaignSetup.experienceSlug')}
              <input
                className="campaign-setup-input"
                value={experienceSlug}
                onChange={(e) => setExperienceSlug(e.target.value)}
                placeholder="demo"
                required
              />
            </label>
            <label className="campaign-setup-label">
              {t('campaignSetup.experienceUniqueId')}
              <input
                className="campaign-setup-input"
                value={experienceUniqueId}
                onChange={(e) => setExperienceUniqueId(e.target.value)}
                placeholder="main"
                required
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="campaign-setup-fieldset">
          <legend>{t('campaignSetup.sectionBranding')}</legend>
          <label className="campaign-setup-label">
            {t('campaignSetup.shopName')}
            <input
              className="campaign-setup-input"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
          </label>
          <div className="campaign-setup-row">
            <label className="campaign-setup-label">
              {t('campaignSetup.primaryColor')}
              <input
                type="color"
                className="campaign-setup-color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
              />
            </label>
            <label className="campaign-setup-label">
              {t('campaignSetup.secondaryColor')}
              <input
                type="color"
                className="campaign-setup-color"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
              />
            </label>
            <label className="campaign-setup-label">
              {t('campaignSetup.accentColor')}
              <input
                type="color"
                className="campaign-setup-color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
              />
            </label>
          </div>
          <label className="campaign-setup-label">
            {t('campaignSetup.fontPairLabel')}
            <select
              className="campaign-setup-input"
              value={fontPairId}
              onChange={(e) => setFontPairId(e.target.value as LandingFontPairId)}
            >
              {FONT_OPTIONS.map((id) => (
                <option key={id} value={id}>
                  {t(`campaignSetup.fontPair.${id}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="campaign-setup-label">
            {t('campaignSetup.layoutLabel')}
            <select
              className="campaign-setup-input"
              value={layoutTemplate}
              onChange={(e) => setLayoutTemplate(e.target.value as LandingLayoutTemplate)}
            >
              {LAYOUT_OPTIONS.map((id) => (
                <option key={id} value={id}>
                  {t(`campaignSetup.layout.${id}`)}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset className="campaign-setup-fieldset">
          <legend>{t('campaignSetup.sectionHero')}</legend>
          <label className="campaign-setup-label">
            {t('campaignSetup.headline')}
            <input
              className="campaign-setup-input"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder={t('campaignSetup.headlinePlaceholder')}
            />
          </label>
          <label className="campaign-setup-label">
            {t('campaignSetup.tagline')}
            <textarea
              className="campaign-setup-textarea"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              rows={2}
              required
            />
          </label>
          <div className="campaign-setup-row campaign-setup-row--grow">
            <label className="campaign-setup-label">
              {t('campaignSetup.ctaLabel')}
              <input
                className="campaign-setup-input"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                required
              />
            </label>
            <label className="campaign-setup-label">
              {t('campaignSetup.ctaUrl')}
              <input
                className="campaign-setup-input"
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                required
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="campaign-setup-fieldset">
          <legend>{t('campaignSetup.sectionStory')}</legend>
          <label className="campaign-setup-label">
            {t('campaignSetup.vpHeadline')}
            <input
              className="campaign-setup-input"
              value={vpHeadline}
              onChange={(e) => setVpHeadline(e.target.value)}
            />
          </label>
          <label className="campaign-setup-label">
            {t('campaignSetup.vpBody')}
            <textarea
              className="campaign-setup-textarea"
              value={vpBody}
              onChange={(e) => setVpBody(e.target.value)}
              rows={3}
            />
          </label>
          <label className="campaign-setup-label">
            {t('campaignSetup.howToOrder')}
            <textarea
              className="campaign-setup-textarea"
              value={howBody}
              onChange={(e) => setHowBody(e.target.value)}
              rows={4}
            />
          </label>
        </fieldset>

        <fieldset className="campaign-setup-fieldset">
          <legend>{t('campaignSetup.sectionSocial')}</legend>
          <label className="campaign-setup-label">
            {t('campaignSetup.instagram')}
            <input
              className="campaign-setup-input"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/…"
            />
          </label>
          <label className="campaign-setup-label">
            {t('campaignSetup.whatsapp')}
            <input
              className="campaign-setup-input"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="https://wa.me/…"
            />
          </label>
          <label className="campaign-setup-label">
            {t('campaignSetup.website')}
            <input
              className="campaign-setup-input"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://…"
            />
          </label>
        </fieldset>

        <fieldset className="campaign-setup-fieldset">
          <legend>{t('campaignSetup.sectionProducts')}</legend>
          <p className="campaign-setup-hint">{t('campaignSetup.productsHint')}</p>
          {productRows.map((row, index) => (
            <div key={row.id} className="campaign-setup-product-card">
              <div className="campaign-setup-product-head">
                <span className="campaign-setup-product-num">
                  {t('campaignSetup.productNumber', { n: String(index + 1) })}
                </span>
                {productRows.length > 1 && (
                  <button type="button" className="campaign-setup-product-remove" onClick={() => removeProductRow(row.id)}>
                    {t('campaignSetup.removeProduct')}
                  </button>
                )}
              </div>
              <label className="campaign-setup-label">
                {t('campaignSetup.productTitle')}
                <input
                  className="campaign-setup-input"
                  value={row.title}
                  onChange={(e) => updateProductRow(row.id, { title: e.target.value })}
                />
              </label>
              <label className="campaign-setup-label">
                {t('campaignSetup.productDescription')}
                <textarea
                  className="campaign-setup-textarea"
                  value={row.description}
                  onChange={(e) => updateProductRow(row.id, { description: e.target.value })}
                  rows={2}
                />
              </label>
              <div className="campaign-setup-row campaign-setup-row--grow">
                <label className="campaign-setup-label">
                  {t('campaignSetup.productPrice')}
                  <input
                    className="campaign-setup-input"
                    value={row.price}
                    onChange={(e) => updateProductRow(row.id, { price: e.target.value })}
                  />
                </label>
                <label className="campaign-setup-label">
                  {t('campaignSetup.productImageUrl')}
                  <input
                    className="campaign-setup-input"
                    value={row.imageUrl}
                    onChange={(e) => updateProductRow(row.id, { imageUrl: e.target.value })}
                    placeholder="https://…"
                  />
                </label>
              </div>
              <div className="campaign-setup-row campaign-setup-row--grow">
                <label className="campaign-setup-label">
                  {t('campaignSetup.productCtaLabel')}
                  <input
                    className="campaign-setup-input"
                    value={row.ctaLabel}
                    onChange={(e) => updateProductRow(row.id, { ctaLabel: e.target.value })}
                  />
                </label>
                <label className="campaign-setup-label">
                  {t('campaignSetup.productCtaUrl')}
                  <input
                    className="campaign-setup-input"
                    value={row.ctaUrl}
                    onChange={(e) => updateProductRow(row.id, { ctaUrl: e.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}
          <button type="button" className="campaign-setup-btn secondary" onClick={addProductRow}>
            {t('campaignSetup.addProduct')}
          </button>
        </fieldset>

        <fieldset className="campaign-setup-fieldset">
          <legend>{t('campaignSetup.sectionGames')}</legend>
          <p className="campaign-setup-hint">{t('campaignSetup.gamesHint')}</p>
          <div className="campaign-setup-checkgrid">
            {PUBLIC_CAMPAIGN_GAMES.map((mode) => (
              <label key={mode} className="campaign-setup-check">
                <input
                  type="checkbox"
                  checked={games[mode] === true}
                  onChange={() => toggleGame(mode)}
                />
                <span>{t(`campaignSetup.game.${mode}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {message && (
          <p className={message.type === 'ok' ? 'campaign-setup-msg ok' : 'campaign-setup-msg err'}>
            {message.text}
          </p>
        )}

        <div className="campaign-setup-actions">
          <button type="submit" className="campaign-setup-btn primary">
            {t('campaignSetup.save')}
          </button>
          <button type="button" className="campaign-setup-btn" onClick={handleClear}>
            {t('campaignSetup.clearDraft')}
          </button>
          <Link className="campaign-setup-btn link" to={`/shop/${CAMPAIGN_PREVIEW_SLUG}`}>
            {t('campaignSetup.openPreview')}
          </Link>
        </div>
      </form>
    </div>
  );
}
