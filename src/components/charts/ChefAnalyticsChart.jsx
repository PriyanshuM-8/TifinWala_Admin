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
import { ChefHat } from 'lucide-react';

const GRID_COLOR = '#E8ECE7';
const TEXT_COLOR = '#737B76';
const TOOLTIP_BG = '#FFFDF8';
const TOOLTIP_BORDER = '#E8ECE7';
const DARK_TEXT = '#27352F';

export const ChefAnalyticsChart = ({ data = [], height = 260 }) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={ChefHat}
        title="No chef registration records"
        description="There are no chef applications registered in this period."
      />
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
          <Bar
            dataKey="registered"
            name="New HomeChefs"
            fill="#F6A23A"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChefAnalyticsChart;
