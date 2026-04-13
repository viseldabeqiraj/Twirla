import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  getAdminSummary,
  getDailyRevenue,
  redeemCoupon,
  type AdminSummary,
  type DailyRevenuePoint,
} from '../api/adminApi';
import FunnelChart from '../components/admin/FunnelChart';
import RedemptionDonut from '../components/admin/RedemptionDonut';
import RevenueChart from '../components/admin/RevenueChart';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';
import './AdminPage.css';

export default function AdminPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { t, i18n } = useTranslation();
  const language = i18n.language as 'en' | 'sq';
  const setLanguage = (lng: 'en' | 'sq') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('twirla_language', lng);
  };

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenuePoint[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [couponCode, setCouponCode] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (!slug || !token) {
      setLoadError(t('dashboard.invalidToken'));
      setLoading(false);
      return;
    }
    Promise.all([getAdminSummary(slug, token), getDailyRevenue(slug, token)])
      .then(([sum, daily]) => {
        setSummary(sum);
        setDailyRevenue(daily);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : t('dashboard.invalidToken')))
      .finally(() => setLoading(false));
  }, [slug, token, t]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !token || !couponCode.trim()) return;
    setRedeemMessage(null);
    setRedeeming(true);
    try {
      await redeemCoupon(slug, token, couponCode.trim(), Number(orderValue) || 0);
      setRedeemMessage({ type: 'success', text: t('dashboard.redeemSuccess') });
      setCouponCode('');
      setOrderValue('');
      if (summary) {
        setSummary({
          ...summary,
          couponsRedeemed: summary.couponsRedeemed + 1,
          attributedRevenue: summary.attributedRevenue + (Number(orderValue) || 0),
        });
      }
    } catch (err) {
      setRedeemMessage({
        type: 'error',
        text: err instanceof Error ? err.message : t('dashboard.redeemFailedGeneric'),
      });
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-loading">{t('dashboard.loading')}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h1>{t('dashboard.adminAccess')}</h1>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  const s = summary!;
  const rewardsGenerated = s.rewardsGenerated ?? 0;
  const codesCopied = s.codesCopied ?? 0;
  const ctaClicks = s.ctaClicks ?? 0;

  const funnelSteps = [
    { label: t('dashboard.funnelVisitors'), value: s.uniqueVisitors },
    { label: t('dashboard.funnelGamesStarted'), value: s.starts },
    { label: t('dashboard.funnelRewardsGenerated'), value: rewardsGenerated },
    { label: t('dashboard.funnelCtaClicks'), value: ctaClicks },
    { label: t('dashboard.funnelCouponsGenerated'), value: s.couponsGenerated },
    { label: t('dashboard.funnelCouponsRedeemed'), value: s.couponsRedeemed },
  ];

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-row">
          <div>
            <h1>{t('dashboard.title')}</h1>
            <p className="admin-slug">{slug}</p>
          </div>
          <div className="admin-lang">
            <button
              type="button"
              className={language === 'en' ? 'admin-lang-btn active' : 'admin-lang-btn'}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={language === 'sq' ? 'admin-lang-btn active' : 'admin-lang-btn'}
              onClick={() => setLanguage('sq')}
            >
              SQ
            </button>
          </div>
        </div>
      </header>

      <section className="admin-summary">
        <h2>{t('dashboard.analyticsSummary')}</h2>
        <div className="admin-cards">
          <div className="admin-card">
            <span className="admin-card-value">{s.uniqueVisitors.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.visitors')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{s.impressions.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.impressions')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{s.starts.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.gamesPlayed')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{s.finishes.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.finishes')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{s.rewardsWon.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.rewardsWon')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{rewardsGenerated.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.rewardsGenerated')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{codesCopied.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.codesCopied')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{ctaClicks.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.ctaClicks')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{s.couponsGenerated.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.couponsGenerated')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{s.couponsRedeemed.toLocaleString()}</span>
            <span className="admin-card-label">{t('dashboard.couponsRedeemed')}</span>
          </div>
          <div className="admin-card">
            <span className="admin-card-value">{formatCurrency(s.attributedRevenue)}</span>
            <span className="admin-card-label">{t('dashboard.revenueGenerated')}</span>
          </div>
        </div>
      </section>

      <section className="admin-charts">
        <FunnelChart steps={funnelSteps} />
        <div className="admin-charts-row">
          <RevenueChart data={dailyRevenue} />
          <RedemptionDonut redeemed={s.couponsRedeemed} generated={s.couponsGenerated} />
        </div>
      </section>

      <section className="admin-redeem">
        <h2>{t('dashboard.manualRedemption')}</h2>
        <form onSubmit={handleRedeem} className="admin-redeem-form">
          <div className="admin-field">
            <label htmlFor="admin-coupon">{t('dashboard.couponCode')}</label>
            <input
              id="admin-coupon"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={t('dashboard.redeemPlaceholder')}
              required
              disabled={redeeming}
            />
          </div>
          <div className="admin-field">
            <label htmlFor="admin-order">{t('dashboard.orderValue')}</label>
            <input
              id="admin-order"
              type="number"
              min="0"
              step="0.01"
              value={orderValue}
              onChange={(e) => setOrderValue(e.target.value)}
              placeholder="0.00"
              disabled={redeeming}
            />
          </div>
          <button type="submit" className="admin-submit" disabled={redeeming}>
            {redeeming ? t('dashboard.redeeming') : t('dashboard.redeemButton')}
          </button>
        </form>
        {redeemMessage && (
          <p className={`admin-feedback admin-feedback--${redeemMessage.type}`}>{redeemMessage.text}</p>
        )}
      </section>
    </div>
  );
}
