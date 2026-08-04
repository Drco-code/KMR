import type { CSSProperties } from 'react';

// Shared visual constants for the custom dashboard, kept in one place so
// every card/tile/chart stays consistent instead of each component
// re-guessing radius/shadow values.
export const CARD_RADIUS = 16;

export const CARD_STYLE: CSSProperties = {
  borderRadius: CARD_RADIUS,
  border: '1px solid rgba(15, 23, 42, 0.06)',
};

// One accent color per "kind" of stat, used both for the stat tile's icon
// badge and consistently reused across charts referencing the same kind of
// data (e.g. the danger red for out-of-stock everywhere it appears).
export const PALETTE = {
  primary: '#4f46e5',
  success: '#16a34a',
  info: '#0891b2',
  warning: '#d97706',
  danger: '#dc2626',
} as const;

export type PaletteKey = keyof typeof PALETTE;

// Soft tinted background for icon badges — same hue as PALETTE, ~12% opacity.
export const PALETTE_TINT: Record<PaletteKey, string> = {
  primary: 'rgba(79, 70, 229, 0.12)',
  success: 'rgba(22, 163, 74, 0.12)',
  info: 'rgba(8, 145, 178, 0.12)',
  warning: 'rgba(217, 119, 6, 0.12)',
  danger: 'rgba(220, 38, 38, 0.12)',
};
