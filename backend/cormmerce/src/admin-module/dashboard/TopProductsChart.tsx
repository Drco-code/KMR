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
import { CARD_STYLE } from './theme.js';

type Props = {
  title: string;
  data: Array<{ productName: string; value: number }>;
  barColor: string;
  valueLabel: string;
};

const TopProductsChart: React.FC<Props> = ({ title, data, barColor, valueLabel }) => (
  <Box bg="white" p="xl" style={CARD_STYLE} flexGrow={1} minWidth="360px">
    <H4 mb="lg" fontWeight="bold">
      {title}
    </H4>
    {data.length === 0 ? (
      <Text color="grey60">No quote requests yet.</Text>
    ) : (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(15, 23, 42, 0.08)" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="productName"
            width={140}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value: number) => [value, valueLabel]} cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
          <Bar dataKey="value" fill={barColor} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </Box>
);

export default TopProductsChart;
