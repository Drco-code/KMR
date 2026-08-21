import React, { useState, useMemo, useEffect } from 'react';
import type { EditPropertyProps } from 'adminjs';
import { Box, Button, FormGroup, Input, Label, Text, Icon } from '@adminjs/design-system';

export interface SignatureColorItem {
  name: string;
  code: string;
}

function parseColors(raw: unknown): SignatureColorItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is SignatureColorItem => Boolean(item && typeof item === 'object' && 'name' in item && 'code' in item))
      .map((item) => ({
        name: String(item.name).trim(),
        code: String(item.code).trim().toUpperCase(),
      }))
      .filter((item) => item.name && item.code);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseColors(parsed);
    } catch {
      return [];
    }
  }
  if (typeof raw === 'object' && raw !== null) {
    return parseColors(Object.values(raw));
  }
  return [];
}

function extractColorsFromParams(params: Record<string, unknown> = {}, path: string = 'colors'): SignatureColorItem[] {
  // 1. Direct property
  const direct = params[path];
  const directParsed = parseColors(direct);
  if (directParsed.length > 0) return directParsed;

  // 2. Scan flattened keys: e.g. "colors.0.name", "colors.0.code" or "colors[0].name"
  const colorMap = new Map<string, { name?: string; code?: string }>();
  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith(`${path}.`) && !key.startsWith(`${path}[`)) continue;
    const match = key.match(/^colors(?:\.|\[)(\d+)\]?(?:\.([a-zA-Z]+))?$/);
    if (match) {
      const index = match[1];
      const field = match[2] || 'name';
      const existing = colorMap.get(index) || {};
      if (field === 'name') existing.name = String(value);
      if (field === 'code') existing.code = String(value);
      colorMap.set(index, existing);
    }
  }

  const result: SignatureColorItem[] = [];
  const sortedKeys = Array.from(colorMap.keys()).sort((a, b) => Number(a) - Number(b));
  for (const k of sortedKeys) {
    const entry = colorMap.get(k);
    if (entry?.name && entry?.code) {
      result.push({
        name: entry.name.trim(),
        code: entry.code.trim().toUpperCase(),
      });
    }
  }
  return result;
}

function normalizeHex(hex: string): string {
  const trimmed = hex.trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
    return (trimmed.startsWith('#') ? trimmed : `#${trimmed}`).toUpperCase();
  }
  if (/^#?[0-9a-fA-F]{3}$/.test(trimmed)) {
    const raw = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toUpperCase();
  }
  return trimmed;
}

const SignatureColorsManager: React.FC<EditPropertyProps> = ({ property, record, onChange }) => {
  const initialColors = useMemo(() => {
    return extractColorsFromParams(record?.params, property.path);
  }, [record?.params, property.path]);

  const [colors, setColors] = useState<SignatureColorItem[]>(initialColors);
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#D4AF37');
  const [filterQuery, setFilterQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync with AdminJS form state on mount or change
  useEffect(() => {
    if (initialColors.length > 0 && (!record.params[property.path] || typeof record.params[property.path] !== 'string')) {
      onChange(property.path, JSON.stringify(initialColors));
    }
  }, []);

  const updateColors = (updated: SignatureColorItem[]) => {
    setColors(updated);
    onChange(property.path, JSON.stringify(updated));
  };

  const handleAddColor = () => {
    const name = newColorName.trim();
    const code = normalizeHex(newColorCode);

    if (!name) {
      setErrorMessage('Please enter a color name (e.g. Royal Blue, Pure White)');
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(code)) {
      setErrorMessage('Please enter a valid 6-digit hex code (e.g. #002366)');
      return;
    }

    const exists = colors.some(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.code.toUpperCase() === code.toUpperCase(),
    );
    if (exists) {
      setErrorMessage('This color name and code combination already exists');
      return;
    }

    setErrorMessage(null);
    const updated = [...colors, { name, code }];
    updateColors(updated);
    setNewColorName('');
  };

  const handleRemoveColor = (indexToRemove: number) => {
    const updated = colors.filter((_, idx) => idx !== indexToRemove);
    updateColors(updated);
  };

  const filteredColors = useMemo(() => {
    if (!filterQuery.trim()) return colors.map((c, i) => ({ ...c, originalIndex: i }));
    const q = filterQuery.toLowerCase().trim();
    return colors
      .map((c, i) => ({ ...c, originalIndex: i }))
      .filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [colors, filterQuery]);

  return (
    <FormGroup style={{ marginBottom: '32px' }}>
      <Label>{property.label ?? 'Available Colors'}</Label>
      <Text variant="grey" style={{ fontSize: '12px', marginBottom: '12px' }}>
        Add as many colors as needed. Customers will pick from these color swatches on the product page.
      </Text>

      {/* Add Color Card */}
      <Box
        p="lg"
        style={{
          backgroundColor: '#F8F9FA',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <Text style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
          Add New Color
        </Text>
        <Box flex style={{ gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Native Picker */}
          <Input
            type="color"
            value={newColorCode.startsWith('#') && newColorCode.length === 7 ? newColorCode : '#D4AF37'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColorCode(e.target.value.toUpperCase())}
            style={{ width: '48px', height: '38px', padding: '2px', cursor: 'pointer', borderRadius: '4px' }}
          />

          {/* Hex Input */}
          <Input
            value={newColorCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColorCode(e.target.value)}
            placeholder="#HEX Code"
            style={{ width: '110px', textTransform: 'uppercase' }}
          />

          {/* Name Input */}
          <Input
            value={newColorName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewColorName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddColor();
              }
            }}
            placeholder="Color Name (e.g. Charcoal Grey, Brilliant White)"
            style={{ flex: 1, minWidth: '220px' }}
          />

          <Button type="button" variant="primary" size="sm" onClick={handleAddColor}>
            <Icon icon="Plus" mr="sm" />
            Add Color
          </Button>
        </Box>

        {errorMessage && (
          <Text variant="danger" style={{ fontSize: '12px', marginTop: '8px' }}>
            {errorMessage}
          </Text>
        )}
      </Box>

      {/* Color Palette List Header */}
      <Box flex style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Text style={{ fontWeight: 600, fontSize: '13px' }}>
          Configured Colors ({colors.length})
        </Text>

        {colors.length > 5 && (
          <Input
            value={filterQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterQuery(e.target.value)}
            placeholder="Search colors..."
            style={{ width: '200px', height: '32px', fontSize: '12px' }}
          />
        )}
      </Box>

      {/* Color Swatches Grid */}
      {colors.length === 0 ? (
        <Box
          p="lg"
          style={{
            border: '1px dashed #CBD5E1',
            borderRadius: '6px',
            textAlign: 'center',
            backgroundColor: '#FAFAFA',
          }}
        >
          <Text variant="grey" style={{ fontSize: '13px' }}>
            No colors added yet. Use the form above to add colors to this paint product.
          </Text>
        </Box>
      ) : (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '10px',
            maxHeight: '360px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {filteredColors.map((color) => (
            <Box
              key={`${color.originalIndex}-${color.code}-${color.name}`}
              flex
              style={{
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <Box flex style={{ alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: color.code,
                    border: '1px solid rgba(0,0,0,0.15)',
                    flexShrink: 0,
                    boxShadow: 'inset 0 0 2px rgba(0,0,0,0.1)',
                  }}
                  title={color.code}
                />
                <Box style={{ overflow: 'hidden' }}>
                  <Text
                    style={{
                      fontWeight: 600,
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {color.name}
                  </Text>
                  <Text variant="grey" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                    {color.code}
                  </Text>
                </Box>
              </Box>

              <Button
                type="button"
                variant="text"
                size="sm"
                onClick={() => handleRemoveColor(color.originalIndex)}
                style={{ color: '#EF4444', padding: '4px' }}
                title="Remove color"
              >
                <Icon icon="Trash2" />
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </FormGroup>
  );
};

export default SignatureColorsManager;
