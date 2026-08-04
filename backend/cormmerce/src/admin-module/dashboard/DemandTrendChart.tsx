import React from 'react';
import { Box, H4, Text } from '@adminjs/design-system';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CARD_STYLE, PALETTE } from './theme.js';
import type { DashboardData } from './types.js';

// Distinct, readable line colors for up to 5 products — reuses the shared
// palette so it stays visually consistent with the stat tiles/other charts.
const LINE_COLORS = [
  PALETTE.primary,
  PALETTE.success,
  PALETTE.danger,
  PALETTE.warning,
  PALETTE.info,
];

const DemandTrendChart: React.FC<{ trend: DashboardData['trend'] }> = ({ trend }) => (
  <Box bg="white" p="xl" style={CARD_STYLE}>
    <H4 mb="lg" fontWeight="bold">
      Demand trend — top 5 products, last 30 days
    </H4>
    {trend.products.length === 0 ? (
      <Text color="grey60">No quote requests yet.</Text>
    ) : (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={trend.days} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.08)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {trend.products.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={LINE_COLORS[index % LINE_COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )}
  </Box>
);

export default DemandTrendChart;
