import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { EmptyState } from '../common/EmptyState';
import { Calendar } from 'lucide-react';

const GRID_COLOR = '#E8ECE7';
const TEXT_COLOR = '#737B76';
const TOOLTIP_BG = '#FFFDF8';
const TOOLTIP_BORDER = '#E8ECE7';
const DARK_TEXT = '#27352F';

export const SubscriptionMealChart = ({ data = {}, height = 260 }) => {
  const chartData = [
    { name: 'Scheduled', count: data.scheduled || 0, fill: '#3B82F6' },
    { name: 'Preparing', count: data.preparing || 0, fill: '#8B5CF6' },
    { name: 'Ready', count: data.ready_for_pickup || 0, fill: '#06B6D4' },
    { name: 'Delivered', count: data.delivered || 0, fill: '#14513F' },
    { name: 'Skipped', count: data.skipped || 0, fill: '#F59E0B' },
    { name: 'Cancelled', count: data.cancelled || 0, fill: '#EF4444' },
  ].filter((item) => item.count > 0 || true);

  const totalMeals = Object.values(data).reduce((acc, c) => acc + (typeof c === 'number' ? c : 0), 0);

  if (totalMeals === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No meal fulfillment records"
        description="No subscription meal orders generated yet."
      />
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="name"
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
          <Bar dataKey="count" name="Meal Count" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SubscriptionMealChart;
