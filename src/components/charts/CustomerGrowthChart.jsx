import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { EmptyState } from '../common/EmptyState';
import { Users } from 'lucide-react';

const GRID_COLOR = '#E8ECE7';
const TEXT_COLOR = '#737B76';
const TOOLTIP_BG = '#FFFDF8';
const TOOLTIP_BORDER = '#E8ECE7';
const DARK_TEXT = '#27352F';

export const CustomerGrowthChart = ({ data = [], height = 260 }) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No registration records"
        description="There are no customer accounts registered within this selected timeframe."
      />
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="customerGrowthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14513F" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#14513F" stopOpacity={0.0} />
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
              color: DARK_TEXT,
            }}
          />
          <Area
            type="monotone"
            dataKey="registered"
            name="New Customers"
            stroke="#14513F"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#customerGrowthGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerGrowthChart;
