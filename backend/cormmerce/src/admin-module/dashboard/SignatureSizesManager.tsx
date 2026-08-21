import React, { useState, useMemo, useEffect } from 'react';
import type { EditPropertyProps } from 'adminjs';
import { Box, Button, FormGroup, Input, Label, Text, Icon } from '@adminjs/design-system';

function extractSizesFromParams(params: Record<string, unknown> = {}, path: string = 'sizes'): string[] {
  // 1. Direct property
  const direct = params[path];
  if (Array.isArray(direct)) {
    const list = direct.map((item) => String(item).trim()).filter(Boolean);
    if (list.length > 0) return list;
  }
  if (typeof direct === 'string') {
    try {
      const parsed = JSON.parse(direct);
      if (Array.isArray(parsed)) {
        const list = parsed.map((item) => String(item).trim()).filter(Boolean);
        if (list.length > 0) return list;
      }
    } catch {
      if (direct.includes(',')) {
        return direct.split(',').map((s) => s.trim()).filter(Boolean);
      } else if (direct.trim()) {
        return [direct.trim()];
      }
    }
  }
  if (typeof direct === 'object' && direct !== null) {
    const list = Object.values(direct).map((item) => String(item).trim()).filter(Boolean);
    if (list.length > 0) return list;
  }

  // 2. Scan flattened keys: e.g. "sizes.0", "sizes.1" or "sizes[0]"
  const sizeMap = new Map<number, string>();
  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith(`${path}.` && !key.startsWith(`${path}[`))) continue;
    const match = key.match(/^sizes(?:\.|\[)(\d+)\]?$/);
    if (match) {
      const index = Number(match[1]);
      if (value) sizeMap.set(index, String(value).trim());
    }
  }

  const sortedIndices = Array.from(sizeMap.keys()).sort((a, b) => a - b);
  return sortedIndices.map((i) => sizeMap.get(i)!).filter(Boolean);
}

const COMMON_PRESETS = ['1L', '4L', '5L', '20L', 'Bucket', 'Drum'];

const SignatureSizesManager: React.FC<EditPropertyProps> = ({ property, record, onChange }) => {
  const initialSizes = useMemo(() => {
    return extractSizesFromParams(record?.params, property.path);
  }, [record?.params, property.path]);

  const [sizes, setSizes] = useState<string[]>(initialSizes);
  const [newSize, setNewSize] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync with AdminJS form state on mount or change
  useEffect(() => {
    if (initialSizes.length > 0 && (!record.params[property.path] || !Array.isArray(record.params[property.path]))) {
      onChange(property.path, initialSizes);
    }
  }, []);

  const updateSizes = (updated: string[]) => {
    setSizes(updated);
    onChange(property.path, updated);
  };

  const handleAddSize = (sizeToAdd?: string) => {
    const candidate = (sizeToAdd ?? newSize).trim();
    if (!candidate) {
      setErrorMessage('Please enter a size label (e.g. 1L, 20L, Drum)');
      return;
    }

    if (sizes.some((s) => s.toLowerCase() === candidate.toLowerCase())) {
      setErrorMessage(`Size "${candidate}" is already added`);
      return;
    }

    setErrorMessage(null);
    const updated = [...sizes, candidate];
    updateSizes(updated);
    if (!sizeToAdd) setNewSize('');
  };

  const handleRemoveSize = (indexToRemove: number) => {
    const updated = sizes.filter((_, idx) => idx !== indexToRemove);
    updateSizes(updated);
  };

  return (
    <FormGroup style={{ marginBottom: '24px' }}>
      <Label>{property.label ?? 'Available Sizes'}</Label>
      <Text variant="grey" style={{ fontSize: '12px', marginBottom: '10px' }}>
        Specify the can/container sizes available for this paint product.
      </Text>

      {/* Input Row */}
      <Box flex style={{ gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <Input
          value={newSize}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNewSize(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSize();
            }
          }}
          placeholder="Enter size (e.g. 1L, 4L, 20L, Drum)"
          style={{ maxWidth: '280px' }}
        />
        <Button type="button" variant="primary" size="sm" onClick={() => handleAddSize()}>
          <Icon icon="Plus" mr="sm" />
          Add Size
        </Button>
      </Box>

      {/* Quick Presets */}
      <Box flex style={{ gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
        <Text variant="grey" style={{ fontSize: '11px', marginRight: '4px' }}>
          Quick add:
        </Text>
        {COMMON_PRESETS.map((preset) => {
          const isAdded = sizes.some((s) => s.toLowerCase() === preset.toLowerCase());
          return (
            <button
              key={preset}
              type="button"
              disabled={isAdded}
              onClick={() => handleAddSize(preset)}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                backgroundColor: isAdded ? '#F1F5F9' : '#FFFFFF',
                color: isAdded ? '#94A3B8' : '#334155',
                cursor: isAdded ? 'default' : 'pointer',
              }}
            >
              + {preset}
            </button>
          );
        })}
      </Box>

      {errorMessage && (
        <Text variant="danger" style={{ fontSize: '12px', marginBottom: '10px' }}>
          {errorMessage}
        </Text>
      )}

      {/* Size Pills Container */}
      <Box
        p="md"
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          backgroundColor: '#FFFFFF',
          minHeight: '48px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {sizes.length === 0 ? (
          <Text variant="grey" style={{ fontSize: '12px' }}>
            No sizes configured yet.
          </Text>
        ) : (
          sizes.map((size, index) => (
            <Box
              key={`${size}-${index}`}
              flex
              style={{
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              <span>{size}</span>
              <button
                type="button"
                onClick={() => handleRemoveSize(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '14px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={`Remove ${size}`}
              >
                ×
              </button>
            </Box>
          ))
        )}
      </Box>
    </FormGroup>
  );
};

export default SignatureSizesManager;
