import React from 'react';
import type { EditPropertyProps } from 'adminjs';
import { Box, FormGroup, Input, Label } from '@adminjs/design-system';

function pickerSafeValue(value: string): string {
  const trimmed = value.trim();
  return /^#(?:[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : '#FFFFFF';
}

const ColorHexInput: React.FC<EditPropertyProps> = ({ property, record, onChange }) => {
  const rawValue = String(record.params[property.path] ?? '').trim();
  const value = rawValue || '#FFFFFF';

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <Box flex style={{ gap: '8px' }}>
        <Input
          type="color"
          value={pickerSafeValue(value)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(property.path, event.target.value.toUpperCase())
          }
          style={{ width: '56px', padding: 0 }}
        />
        <Input
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(property.path, event.target.value)
          }
          placeholder="#FFFFFF or rgb(255, 255, 255)"
        />
      </Box>
    </FormGroup>
  );
};

export default ColorHexInput;
