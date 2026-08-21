import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import type { EditPropertyProps } from 'adminjs';
import { FormGroup, Label, Select } from '@adminjs/design-system';
import { buildBreadcrumbOptions, selfAndDescendantIds, type CategoryLike, type CategoryOption } from './category-breadcrumb.js';

const api = new ApiClient();

const CategoryParentSelect: React.FC<EditPropertyProps> = (props) => {
  const { property, record, onChange } = props;
  const [options, setOptions] = useState<CategoryOption[] | null>(null);

  useEffect(() => {
    api
      .resourceAction({ resourceId: 'Category', actionName: 'list', params: { perPage: 1000 } })
      .then((response) => {
        // AdminJS's "list" action exposes this self-relation under the
        // Prisma field name `parent` (a reference-typed property), not the
        // raw `parentId` scalar column — the scalar is only surfaced as its
        // own editable property on the edit/new forms (see admin-module.
        // service.ts's `parentId` property override), never in list results.
        const categories: CategoryLike[] = (response.data.records ?? []).map((r: any) => ({
          id: r.params.id,
          name: r.params.name,
          parentId: r.params.parent ?? null,
        }));
        // record.id is empty on the "new" form — nothing to exclude yet.
        const excludeIds = record.id ? selfAndDescendantIds(categories, record.id) : undefined;
        setOptions(buildBreadcrumbOptions(categories, excludeIds ? { excludeIds } : undefined));
      })
      .catch(() => setOptions([]));
  }, [record.id]);

  // AdminJS/Prisma adapter surfaces the FK scalar as `parentId` on the edit
  // form but as `parent` (the relation name) in list results.  Check both so
  // the dropdown always pre-populates the current parent when editing.
  const currentValue =
    (record.params[property.path] as string | undefined) ||
    (record.params['parentId'] as string | undefined) ||
    (record.params['parent'] as string | undefined) ||
    '';
  const selected = options?.find((o) => o.value === currentValue) ?? null;

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <Select
        isLoading={!options}
        isClearable
        options={options ?? []}
        value={selected}
        onChange={(option: CategoryOption | null) => onChange(property.path, option?.value ?? '')}
      />
    </FormGroup>
  );
};

export default CategoryParentSelect;
