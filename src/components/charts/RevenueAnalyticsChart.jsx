import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { EmptyState } from '../common/EmptyState';
import { Coins } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const GRID_COLOR = '#E8ECE7';
const TEXT_COLOR = '#737B76';
const TOOLTIP_BG = '#FFFDF8';
const TOOLTIP_BORDER = '#E8ECE7';
const DARK_TEXT = '#27352F';

export const RevenueAnalyticsChart = ({ data = [], height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Coins}
        title="No revenue trend data"
        description="There are no settled financial transactions recorded for this period."
      />
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: TOOLTIP_BG,
            borderColor: TOOLTIP_BORDER,
            borderRadius: '12px',
            padding: '12px',
            fontSize: '12px',
            border: '1px solid #E8ECE7',
            boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.08)',
            color: DARK_TEXT,
          }}
        >
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between gap-4 py-0.5">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={TEXT_COLOR}
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
          />
          <YAxis
            stroke={TEXT_COLOR}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }}
          />

          <Bar
            dataKey="grossRevenue"
            name="Gross GMV"
            fill="#14513F"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="platformCommission"
            name="Platform Commission"
            fill="#F6A23A"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="chefPayouts"
            name="Chef Earnings"
            fill="#26785D"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueAnalyticsChart;
