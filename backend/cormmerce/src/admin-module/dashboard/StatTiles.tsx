import React from 'react';
import { Box, H2, Text } from '@adminjs/design-system';
import type { DashboardData } from './types.js';

const TILES: Array<{
  label: string;
  key: keyof DashboardData['stats'];
  variant: 'primary' | 'success' | 'danger' | 'info';
}> = [
  { label: 'Total products', key: 'totalProducts', variant: 'primary' },
  { label: 'Active', key: 'activeProducts', variant: 'success' },
  { label: 'Inactive', key: 'inactiveProducts', variant: 'info' },
  { label: 'Out of stock', key: 'outOfStockProducts', variant: 'danger' },
  { label: 'Featured', key: 'featuredProducts', variant: 'info' },
];

const COLORS: Record<string, string> = {
  primary: '#2d69f0',
  success: '#22a06b',
  danger: '#e0483e',
  info: '#6e6e6e',
};

const StatTiles: React.FC<{ stats: DashboardData['stats'] }> = ({ stats }) => (
  <Box
    flex
    flexWrap="wrap"
    style={{ gap: '16px' }}
    mb="xl"
  >
    {TILES.map((tile) => (
      <Box
        key={tile.key}
        flexGrow={1}
        minWidth="160px"
        bg="white"
        p="lg"
        style={{ borderRadius: 8, borderTop: `3px solid ${COLORS[tile.variant]}` }}
        boxShadow="card"
      >
        <Text fontSize="sm" color="grey60">
          {tile.label}
        </Text>
        <H2 mt="sm" mb={0}>
          {stats[tile.key]}
        </H2>
      </Box>
    ))}
  </Box>
);

export default StatTiles;
