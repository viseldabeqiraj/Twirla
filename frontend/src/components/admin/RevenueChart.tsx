import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatters';

export interface RevenueDataPoint {
  date: string;
  amount: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

/**
 * Line chart of attributed revenue over time (daily).
 */
export default function RevenueChart({ data }: RevenueChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((d) => ({
    ...d,
    displayDate: formatShortDate(d.date),
  }));

  return (
    <div className="admin-chart-block">
      <h3 className="admin-chart-title">{t('dashboard.revenueOverTime')}</h3>
      <div className="admin-chart-responsive">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#ddd' }}
            />
            <YAxis
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), t('dashboard.revenueGenerated')]}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.date ? formatShortDate(payload[0].payload.date) : ''
              }
              contentStyle={{ borderRadius: 8, border: '1px solid #eee' }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function formatShortDate(isoDate: string): string {
  try {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return isoDate;
  }
}
