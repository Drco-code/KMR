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
        const categories: CategoryLike[] = (response.data.records ?? []).map((r: any) => ({
          id: r.params.id,
          name: r.params.name,
          parentId: r.params.parentId ?? null,
        }));
        // record.id is empty on the "new" form — nothing to exclude yet.
        const excludeIds = record.id ? selfAndDescendantIds(categories, record.id) : undefined;
        setOptions(buildBreadcrumbOptions(categories, excludeIds ? { excludeIds } : undefined));
      })
      .catch(() => setOptions([]));
  }, [record.id]);

  const currentValue = record.params[property.path] as string | undefined;
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
