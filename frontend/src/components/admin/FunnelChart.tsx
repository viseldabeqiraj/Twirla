import { useTranslation } from 'react-i18next';

export interface FunnelStep {
  label: string;
  value: number;
}

interface FunnelChartProps {
  steps: FunnelStep[];
}

/**
 * Horizontal step funnel: Visitors → Games started → Coupons generated → Coupons redeemed.
 */
export default function FunnelChart({ steps }: FunnelChartProps) {
  const { t } = useTranslation();
  const maxValue = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="admin-funnel">
      <h3 className="admin-chart-title">{t('dashboard.funnelTitle')}</h3>
      <div className="admin-funnel-steps">
        {steps.map((step, index) => (
          <div key={index} className="admin-funnel-step">
            <div
              className="admin-funnel-bar"
              style={{ width: `${Math.max((step.value / maxValue) * 100, 4)}%` }}
            />
            <div className="admin-funnel-label">
              <span className="admin-funnel-value">{step.value.toLocaleString()}</span>
              <span className="admin-funnel-name">{step.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
