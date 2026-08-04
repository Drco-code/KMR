import React from 'react';
import { Box, Icon, Text } from '@adminjs/design-system';
import { CARD_STYLE, PALETTE, PALETTE_TINT, type PaletteKey } from './theme.js';
import type { DashboardData } from './types.js';

const TILES: Array<{
  label: string;
  key: keyof DashboardData['stats'];
  icon: string;
  variant: PaletteKey;
}> = [
  { label: 'Total products', key: 'totalProducts', icon: 'Package', variant: 'primary' },
  { label: 'Active', key: 'activeProducts', icon: 'CheckCircle', variant: 'success' },
  { label: 'Inactive', key: 'inactiveProducts', icon: 'PauseCircle', variant: 'info' },
  { label: 'Out of stock', key: 'outOfStockProducts', icon: 'AlertTriangle', variant: 'danger' },
  { label: 'Featured', key: 'featuredProducts', icon: 'Star', variant: 'warning' },
];

const StatTiles: React.FC<{ stats: DashboardData['stats'] }> = ({ stats }) => (
  <Box flex flexWrap="wrap" style={{ gap: '16px' }} mb="xl">
    {TILES.map((tile) => (
      <Box
        key={tile.key}
        flexGrow={1}
        minWidth="180px"
        bg="white"
        p="xl"
        style={CARD_STYLE}
      >
        <Box
          flex
          alignItems="center"
          justifyContent="center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: PALETTE_TINT[tile.variant],
          }}
          mb="lg"
        >
          <Icon icon={tile.icon} size={20} color={PALETTE[tile.variant]} />
        </Box>
        <Text fontSize="28px" fontWeight="bold" color="grey100" style={{ lineHeight: 1.1 }}>
          {stats[tile.key]}
        </Text>
        <Text fontSize="sm" color="grey60" mt="xs">
          {tile.label}
        </Text>
      </Box>
    ))}
  </Box>
);

export default StatTiles;
