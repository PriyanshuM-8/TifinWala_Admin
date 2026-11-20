import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { EmptyState } from '../common/EmptyState';
import { TrendingUp } from 'lucide-react';

const GRID_COLOR = '#E8ECE7';
const TEXT_COLOR = '#737B76';
const TOOLTIP_BG = '#FFFDF8';
const TOOLTIP_BORDER = '#E8ECE7';
const DARK_TEXT = '#27352F';

export const OrderAnalyticsChart = ({ data = [], height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No order trend data"
        description="There are no completed or active orders recorded within this date range."
      />
    );
  }

  // Format data for Recharts
  const formattedData = data.map((item) => ({
    date: item.date || item._id,
    'Total Orders': item.totalOrders || 0,
    'Delivered Orders': item.deliveredOrders || 0,
    'Cancelled Orders': item.cancelledOrders || 0,
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="totalOrdersGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14513F" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#14513F" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="deliveredOrdersGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#26785D" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#26785D" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="cancelledOrdersGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
            </linearGradient>
          </defs>

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
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: TOOLTIP_BG,
              borderColor: TOOLTIP_BORDER,
              borderRadius: '12px',
              fontSize: '12px',
              boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.08)',
              color: DARK_TEXT,
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }}
          />

          <Area
            type="monotone"
            dataKey="Total Orders"
            stroke="#14513F"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#totalOrdersGrad)"
          />
          <Area
            type="monotone"
            dataKey="Delivered Orders"
            stroke="#26785D"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#deliveredOrdersGrad)"
          />
          <Area
            type="monotone"
            dataKey="Cancelled Orders"
            stroke="#F43F5E"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#cancelledOrdersGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderAnalyticsChart;
