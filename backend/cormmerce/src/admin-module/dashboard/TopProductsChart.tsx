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

type Props = {
  title: string;
  data: Array<{ productName: string; value: number }>;
  barColor: string;
  valueLabel: string;
};

const TopProductsChart: React.FC<Props> = ({ title, data, barColor, valueLabel }) => (
  <Box bg="white" p="lg" style={{ borderRadius: 8 }} boxShadow="card" flexGrow={1} minWidth="360px">
    <H4>{title}</H4>
    {data.length === 0 ? (
      <Text color="grey60">No quote requests yet.</Text>
    ) : (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="productName"
            width={140}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value: number) => [value, valueLabel]} />
          <Bar dataKey="value" fill={barColor} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </Box>
);

export default TopProductsChart;
