import React from 'react';
import type { BasePropertyProps } from 'adminjs';
import { Box, Icon } from '@adminjs/design-system';

function extractImages(params: Record<string, unknown> = {}, path: string = 'images'): string[] {
  const direct = params[path];
  if (Array.isArray(direct)) {
    return direct.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof direct === 'string' && direct.trim()) {
    try {
      const parsed = JSON.parse(direct);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      return [direct.trim()];
    }
  }

  // Check flattened keys like images.0, images.1
  const list: { idx: number; url: string }[] = [];
  for (const [key, val] of Object.entries(params)) {
    if (key.startsWith(`${path}.`) && typeof val === 'string' && val.trim()) {
      const match = key.match(new RegExp(`^${path}\\.(\\d+)`));
      if (match) {
        list.push({ idx: Number(match[1]), url: val.trim() });
      }
    }
  }

  if (list.length > 0) {
    list.sort((a, b) => a.idx - b.idx);
    return list.map((item) => item.url);
  }

  // Fallbacks for single image columns like heroImage or logo
  if (typeof params.heroImage === 'string' && params.heroImage.trim()) {
    return [params.heroImage.trim()];
  }
  if (typeof params.logo === 'string' && params.logo.trim()) {
    return [params.logo.trim()];
  }

  return [];
}

const ProductThumbnailCell: React.FC<BasePropertyProps> = ({ record, property }) => {
  const images = extractImages(record?.params, property.path);

  if (images.length === 0) {
    return (
      <Box
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          backgroundColor: '#F1F5F9',
          border: '1px dashed #CBD5E1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94A3B8',
        }}
        title="No image"
      >
        <Icon icon="Image" />
      </Box>
    );
  }

  const primaryImage = images[0];
  const additionalCount = images.length - 1;

  return (
    <Box flex alignItems="center" style={{ gap: '6px' }}>
      <img
        src={primaryImage}
        alt={String(record?.params?.name || 'Thumbnail')}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '6px',
          objectFit: 'cover',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          backgroundColor: '#F8FAFC',
        }}
      />
      {additionalCount > 0 && (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#64748B',
            backgroundColor: '#F1F5F9',
            padding: '2px 5px',
            borderRadius: '4px',
            border: '1px solid #E2E8F0',
          }}
          title={`${images.length} photos total`}
        >
          +{additionalCount}
        </span>
      )}
    </Box>
  );
};

export default ProductThumbnailCell;
