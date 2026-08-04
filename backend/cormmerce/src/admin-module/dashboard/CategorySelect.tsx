import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import type { EditPropertyProps } from 'adminjs';
import { FormGroup, Label, Select } from '@adminjs/design-system';

const api = new ApiClient();

type CategoryOption = {
  value: string;
  label: string;
};

// Category is a self-referential tree (parentId), but AdminJS's default
// reference dropdown just lists every Category row flat, sorted however
// the DB returns them — "Power Tool (A-M)" looks identical to any other
// row, with no indication it's a child of "Tools". That made it easy to
// assign a Product to the wrong level of the tree, which the storefront
// then either miscategorized or silently dropped from listings (see
// lib/catalog.ts on the frontend for the matching logic this feeds into).
// This replaces the default reference input with one that prefixes each
// option with its full ancestor chain, e.g. "Tools > Power Tool (A-M)".
function buildBreadcrumbOptions(
  categories: Array<{ id: string; name: string; parentId: string | null }>,
): CategoryOption[] {
  const byId = new Map(categories.map((c) => [c.id, c]));

  function breadcrumb(category: { id: string; name: string; parentId: string | null }): string {
    const names: string[] = [];
    let current: typeof category | undefined = category;
    const seen = new Set<string>(); // guards against cyclical parentId data
    while (current && !seen.has(current.id)) {
      names.unshift(current.name);
      seen.add(current.id);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return names.join(' > ');
  }

  return categories
    .map((c) => ({ value: c.id, label: breadcrumb(c) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const CategorySelect: React.FC<EditPropertyProps> = (props) => {
  const { property, record, onChange } = props;
  const [options, setOptions] = useState<CategoryOption[] | null>(null);

  useEffect(() => {
    api
      .resourceAction({ resourceId: 'Category', actionName: 'list', params: { perPage: 1000 } })
      .then((response) => {
        const categories = (response.data.records ?? []).map((r: any) => ({
          id: r.params.id,
          name: r.params.name,
          parentId: r.params.parentId ?? null,
        }));
        setOptions(buildBreadcrumbOptions(categories));
      })
      .catch(() => setOptions([]));
  }, []);

  const currentValue = record.params[property.path] as string | undefined;
  const selected = options?.find((o) => o.value === currentValue) ?? null;

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <Select
        isLoading={!options}
        options={options ?? []}
        value={selected}
        onChange={(option: CategoryOption | null) => onChange(property.path, option?.value ?? '')}
      />
    </FormGroup>
  );
};

export default CategorySelect;
