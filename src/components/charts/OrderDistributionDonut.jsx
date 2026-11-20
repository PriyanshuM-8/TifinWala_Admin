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
import { PieChart as PieIcon } from 'lucide-react';

const STATUS_COLORS = {
  pending_confirmation: '#F59E0B',
  accepted: '#3B82F6',
  preparing: '#8B5CF6',
  ready_for_pickup: '#06B6D4',
  out_for_delivery: '#10B981',
  delivered: '#14513F',
  cancelled: '#EF4444',
  rejected: '#6B7280',
};

const TOOLTIP_BG = '#FFFDF8';
const TOOLTIP_BORDER = '#E8ECE7';
const DARK_TEXT = '#27352F';

export const OrderDistributionDonut = ({ data = {}, height = 280 }) => {
  // Convert status map to array
  const chartData = Object.entries(data)
    .filter(([key, val]) => key !== 'total' && val > 0)
    .map(([key, val]) => ({
      name: key.replace(/_/g, ' '),
      value: val,
      color: STATUS_COLORS[key] || '#9CA3AF',
    }));

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={PieIcon}
        title="No order distribution"
        description="No orders have been recorded to calculate status distribution."
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
            height={40}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', textTransform: 'capitalize' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderDistributionDonut;
