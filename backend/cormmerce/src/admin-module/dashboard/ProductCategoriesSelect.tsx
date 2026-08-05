import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import type { EditPropertyProps } from 'adminjs';
import { Box, CheckBox, FormGroup, Label, Loader, RadioGroup, Radio } from '@adminjs/design-system';
import { buildBreadcrumbOptions, type CategoryLike, type CategoryOption } from './category-breadcrumb.js';

const api = new ApiClient();

// Renders two virtual (non-Prisma-column) properties in one form group:
// `categoryIds` (which categories this product belongs to) and
// `primaryCategoryId` (which one of those drives the storefront breadcrumb).
// AdminModuleService's Product `after` hook on new/edit reads these two
// params off the payload and syncs the real ProductCategory join rows.
const ProductCategoriesSelect: React.FC<EditPropertyProps> = ({ record, onChange }) => {
  const [options, setOptions] = useState<CategoryOption[] | null>(null);

  useEffect(() => {
    api
      .resourceAction({ resourceId: 'Category', actionName: 'list', params: { perPage: 1000 } })
      .then((response) => {
        const categories: CategoryLike[] = (response.data.records ?? []).map((r: any) => ({
          id: r.params.id,
          name: r.params.name,
          parentId: r.params.parentId ?? null,
        }));
        setOptions(buildBreadcrumbOptions(categories));
      })
      .catch(() => setOptions([]));
  }, []);

  const selectedIds: string[] = record.params.categoryIds
    ? String(record.params.categoryIds).split(',').filter(Boolean)
    : (record.params.categories ?? []).map((c: { id: string }) => c.id);
  const primaryId: string | undefined = record.params.primaryCategoryId
    ?? (record.params.categories ?? []).find((c: { isPrimary: boolean }) => c.isPrimary)?.id;

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((v) => v !== id)
      : [...selectedIds, id];
    onChange('categoryIds', next.join(','));
    if (!next.includes(primaryId ?? '') && next.length > 0) {
      onChange('primaryCategoryId', next[0]);
    }
  }

  if (!options) {
    return (
      <Box p="default" flex justifyContent="center">
        <Loader />
      </Box>
    );
  }

  return (
    <FormGroup>
      <Label>Categories</Label>
      <Box style={{ maxHeight: '260px', overflowY: 'auto' }}>
        {options.map((option) => {
          const checked = selectedIds.includes(option.value);
          return (
            <Box key={option.value} flex alignItems="center" style={{ gap: '10px' }} py="xs">
              <CheckBox
                id={`cat-${option.value}`}
                checked={checked}
                onChange={() => toggle(option.value)}
              />
              <Label htmlFor={`cat-${option.value}`} style={{ margin: 0, flex: 1 }}>
                {option.label}
              </Label>
              {checked && (
                <RadioGroup>
                  <Radio
                    id={`primary-${option.value}`}
                    name="primaryCategoryId"
                    checked={primaryId === option.value}
                    onChange={() => onChange('primaryCategoryId', option.value)}
                  />
                  <Label htmlFor={`primary-${option.value}`} style={{ margin: 0 }}>
                    Primary
                  </Label>
                </RadioGroup>
              )}
            </Box>
          );
        })}
      </Box>
    </FormGroup>
  );
};

export default ProductCategoriesSelect;
