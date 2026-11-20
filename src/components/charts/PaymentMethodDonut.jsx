import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { EmptyState } from '../common/EmptyState';
import { CreditCard } from 'lucide-react';

const METHOD_COLORS = {
  online: '#14513F',
  cod: '#F6A23A',
  wallet: '#8B5CF6',
};

const TOOLTIP_BG = '#FFFDF8';
const TOOLTIP_BORDER = '#E8ECE7';
const DARK_TEXT = '#27352F';

export const PaymentMethodDonut = ({ data = [], height = 280 }) => {
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item._id === 'online' ? 'Online Prepaid' : item._id === 'cod' ? 'Cash on Delivery' : item._id,
      value: item.count,
      color: METHOD_COLORS[item._id] || '#6B7280',
    }));

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No payment records"
        description="No payments recorded for this selected range."
      />
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: TOOLTIP_BG,
              borderColor: TOOLTIP_BORDER,
              borderRadius: '12px',
              fontSize: '12px',
              color: DARK_TEXT,
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentMethodDonut;
