import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { formatPercent } from '../../utils/formatters';

interface RedemptionDonutProps {
  redeemed: number;
  generated: number;
}

const REDEEMED_COLOR = '#16a34a';
const UNREDEEMED_COLOR = '#e5e7eb';

/**
 * Donut chart: redemption rate = couponsRedeemed / couponsGenerated.
 */
export default function RedemptionDonut({ redeemed, generated }: RedemptionDonutProps) {
  const { t } = useTranslation();

  const unredeemed = Math.max(generated - redeemed, 0);
  const rate = generated > 0 ? (redeemed / generated) * 100 : 0;

  const data = [
    { name: t('dashboard.couponsRedeemed'), value: redeemed, color: REDEEMED_COLOR },
    { name: t('dashboard.couponsGenerated') + ' (unredeemed)', value: unredeemed, color: UNREDEEMED_COLOR },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    data.push({ name: t('dashboard.couponsGenerated'), value: 1, color: UNREDEEMED_COLOR });
  }

  return (
    <div className="admin-chart-block admin-donut-block">
      <h3 className="admin-chart-title">{t('dashboard.redemptionRate')}</h3>
      <p className="admin-donut-percent">{formatPercent(rate, 0)}</p>
      <div className="admin-chart-responsive admin-donut-responsive">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: number) => [val.toLocaleString(), '']}
              contentStyle={{ borderRadius: 8, border: '1px solid #eee' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
