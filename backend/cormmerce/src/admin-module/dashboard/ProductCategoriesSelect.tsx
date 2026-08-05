import React, { useEffect, useMemo, useState } from 'react';
import { ApiClient } from 'adminjs';
import type { EditPropertyProps } from 'adminjs';
import { Box, Button, FormGroup, Label, Loader, Radio, Select } from '@adminjs/design-system';
import { buildBreadcrumbOptions, type CategoryLike } from './category-breadcrumb.js';

const api = new ApiClient();

interface SelectOption {
  value: string;
  label: string;
}

// Renders two virtual (non-Prisma-column) properties in one form group:
// `categoryIds` (which categories this product belongs to) and
// `primaryCategoryId` (which one of those drives the storefront breadcrumb).
// AdminModuleService's Product `after` hook on new/edit reads these two
// params off the payload and syncs the real ProductCategory join rows.
//
// Staff pick one category path at a time via three cascading dropdowns
// (top -> sub -> sub-sub, each narrowed to the previous pick's actual
// children — never a free choice outside the real tree), click "Add" to
// append the resolved category to the list below, and repeat to assign a
// product to more than one category. One entry in the list is marked
// Primary.
const ProductCategoriesSelect: React.FC<EditPropertyProps> = ({ record, onChange }) => {
  const [categories, setCategories] = useState<CategoryLike[] | null>(null);
  const [top, setTop] = useState<SelectOption | null>(null);
  const [sub, setSub] = useState<SelectOption | null>(null);
  const [subSub, setSubSub] = useState<SelectOption | null>(null);

  useEffect(() => {
    api
      .resourceAction({ resourceId: 'Category', actionName: 'list', params: { perPage: 1000 } })
      .then((response) => {
        // AdminJS's "list" action exposes this self-relation under the
        // Prisma field name `parent` (a reference-typed property), not the
        // raw `parentId` scalar column — the scalar is only surfaced as its
        // own editable property on the edit/new forms (see admin-module.
        // service.ts's `parentId` property override), never in list results.
        const list: CategoryLike[] = (response.data.records ?? []).map((r: any) => ({
          id: r.params.id,
          name: r.params.name,
          parentId: r.params.parent ?? null,
        }));
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, []);

  function childrenOf(parentId: string | null): SelectOption[] {
    return (categories ?? [])
      .filter((c) => c.parentId === parentId)
      .map((c) => ({ value: c.id, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  const topOptions = useMemo(() => childrenOf(null), [categories]);
  const subOptions = top ? childrenOf(top.value) : [];
  const subSubOptions = sub ? childrenOf(sub.value) : [];

  const breadcrumbOptions = useMemo(
    () => buildBreadcrumbOptions(categories ?? []),
    [categories],
  );
  const breadcrumbFor = (id: string) => breadcrumbOptions.find((o) => o.value === id)?.label ?? id;

  const selectedIds: string[] = record.params.categoryIds
    ? String(record.params.categoryIds).split(',').filter(Boolean)
    : (record.params.categories ?? []).map((c: { id: string }) => c.id);
  const primaryId: string | undefined = record.params.primaryCategoryId
    ?? (record.params.categories ?? []).find((c: { isPrimary: boolean }) => c.isPrimary)?.id;

  function setSelectedIds(next: string[]) {
    onChange('categoryIds', next.join(','));
    if (!next.includes(primaryId ?? '') && next.length > 0) {
      onChange('primaryCategoryId', next[0]);
    }
  }

  function addSelection() {
    // The deepest level the staff member picked is the category actually
    // added — e.g. picking only a top category (one with no children, or
    // simply stopping there) files the product directly under it.
    const leaf = subSub ?? sub ?? top;
    if (!leaf || selectedIds.includes(leaf.value)) return;
    setSelectedIds([...selectedIds, leaf.value]);
    setTop(null);
    setSub(null);
    setSubSub(null);
  }

  function removeSelection(id: string) {
    setSelectedIds(selectedIds.filter((v) => v !== id));
  }

  if (!categories) {
    return (
      <Box p="default" flex justifyContent="center">
        <Loader />
      </Box>
    );
  }

  return (
    <FormGroup>
      <Label>Categories</Label>

      <Box flex style={{ gap: '8px' }} mb="default">
        <Box style={{ flex: 1 }}>
          <Select
            placeholder="Top category"
            options={topOptions}
            value={top}
            onChange={(option: SelectOption | null) => {
              setTop(option);
              setSub(null);
              setSubSub(null);
            }}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <Select
            placeholder="Sub category"
            options={subOptions}
            value={sub}
            isDisabled={!top || subOptions.length === 0}
            onChange={(option: SelectOption | null) => {
              setSub(option);
              setSubSub(null);
            }}
          />
        </Box>
        <Box style={{ flex: 1 }}>
          <Select
            placeholder="Sub-sub category"
            options={subSubOptions}
            value={subSub}
            isDisabled={!sub || subSubOptions.length === 0}
            onChange={(option: SelectOption | null) => setSubSub(option)}
          />
        </Box>
        <Button type="button" onClick={addSelection} disabled={!top}>
          Add
        </Button>
      </Box>

      <Box>
        {selectedIds.length === 0 && (
          <Label style={{ opacity: 0.6 }}>No categories added yet</Label>
        )}
        {selectedIds.map((id) => (
          <Box key={id} flex alignItems="center" style={{ gap: '10px' }} py="xs">
            <Label style={{ margin: 0, flex: 1 }}>{breadcrumbFor(id)}</Label>
            <Radio
              id={`primary-${id}`}
              name="primaryCategoryId"
              checked={primaryId === id}
              onChange={() => onChange('primaryCategoryId', id)}
            />
            <Label htmlFor={`primary-${id}`} style={{ margin: 0 }}>
              Primary
            </Label>
            <Button type="button" size="sm" color="danger" onClick={() => removeSelection(id)}>
              Remove
            </Button>
          </Box>
        ))}
      </Box>
    </FormGroup>
  );
};

export default ProductCategoriesSelect;
