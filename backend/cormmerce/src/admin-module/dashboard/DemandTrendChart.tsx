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
import type { DashboardData } from './types.js';

// Distinct, readable line colors for up to 5 products.
const LINE_COLORS = ['#2d69f0', '#22a06b', '#e0483e', '#c98307', '#8956d6'];

const DemandTrendChart: React.FC<{ trend: DashboardData['trend'] }> = ({ trend }) => (
  <Box bg="white" p="lg" style={{ borderRadius: 8 }} boxShadow="card">
    <H4>Demand trend — top 5 products, last 30 days</H4>
    {trend.products.length === 0 ? (
      <Text color="grey60">No quote requests yet.</Text>
    ) : (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={trend.days} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
          <YAxis allowDecimals={false} />
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
