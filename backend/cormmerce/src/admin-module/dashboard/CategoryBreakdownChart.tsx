import React from 'react';
import { Box, H4, Text } from '@adminjs/design-system';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardData } from './types.js';

// Horizontal layout (not vertical bars with rotated labels) because the
// category list is a full tree — including parent "group header" categories
// with 0 direct products — so it can run long. Rotated x-axis labels on a
// fixed-height vertical chart just overlapped into an unreadable pile;
// one row per category, sized to the actual category count, scales instead.
const CategoryBreakdownChart: React.FC<{ data: DashboardData['categoryBreakdown'] }> = ({
  data,
}) => {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const chartHeight = Math.max(200, sorted.length * 32);

  return (
    <Box bg="white" p="lg" style={{ borderRadius: 8 }} boxShadow="card" flexGrow={1} minWidth="360px">
      <H4>Products per category</H4>
      {sorted.length === 0 ? (
        <Text color="grey60">No categories yet.</Text>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="category"
              width={160}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value: number) => [value, 'Products']} />
            <Bar dataKey="count" fill="#2d69f0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default CategoryBreakdownChart;
