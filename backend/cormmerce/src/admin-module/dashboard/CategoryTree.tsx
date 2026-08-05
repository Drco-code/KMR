import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import { Box, Button, CheckBox, H2, Icon, Label, Loader, MessageBox, Text } from '@adminjs/design-system';

const api = new ApiClient();

interface CategoryRow {
  id: string;
  name: string;
  parentId: string | null;
  showInNav: boolean;
  navOrder: number;
}

interface TreeNode extends CategoryRow {
  depth: number;
}

function flattenTree(categories: CategoryRow[]): TreeNode[] {
  const byParent = new Map<string | null, CategoryRow[]>();
  for (const category of categories) {
    const siblings = byParent.get(category.parentId) ?? [];
    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }
  for (const siblings of byParent.values()) {
    siblings.sort((a, b) => a.navOrder - b.navOrder || a.name.localeCompare(b.name));
  }

  const result: TreeNode[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const category of byParent.get(parentId) ?? []) {
      result.push({ ...category, depth });
      walk(category.id, depth + 1);
    }
  }
  walk(null, 0);
  return result;
}

const CategoryTree: React.FC = () => {
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  function load() {
    api
      .getPage<CategoryRow[]>({ pageName: 'categoryTree' })
      .then((response) => setCategories(response.data))
      .catch(() => setLoadError('Could not load categories.'));
  }

  useEffect(load, []);

  async function saveField(id: string, data: Partial<Pick<CategoryRow, 'showInNav' | 'navOrder'>>) {
    setSavingId(id);
    try {
      await api.recordAction({
        resourceId: 'Category',
        recordId: id,
        actionName: 'edit',
        method: 'post',
        data,
      });
      setCategories((current) =>
        (current ?? []).map((c) => (c.id === id ? { ...c, ...data } : c)),
      );
      // Clear any previous save error on success
      setSaveError(null);
    } catch {
      setSaveError('Failed to save a change — please retry.');
    } finally {
      setSavingId(null);
    }
  }

  // Initial load failure: show full-page error (no tree to display)
  if (loadError) {
    return (
      <Box p="xl">
        <MessageBox message={loadError} variant="danger" />
      </Box>
    );
  }

  // Still loading: show spinner
  if (!categories) {
    return (
      <Box p="xxl" flex justifyContent="center">
        <Loader />
      </Box>
    );
  }

  const rows = flattenTree(categories);

  return (
    <Box p="xl">
      {/* Save error banner: dismissible, does not unmount the tree */}
      {saveError && (
        <Box mb="lg">
          <MessageBox message={saveError} variant="danger">
            <Button onClick={() => setSaveError(null)}>Dismiss</Button>
          </MessageBox>
        </Box>
      )}

      <Box mb="lg">
        <H2 fontWeight="bold" mb="xs">
          Category Tree
        </H2>
        <Text color="grey60">
          Control which categories show in the storefront's dropdown nav, and their order within
          each level. Changes save immediately.
        </Text>
      </Box>

      <Box>
        {rows.map((row) => (
          <Box
            key={row.id}
            flex
            alignItems="center"
            style={{ gap: '16px', paddingLeft: `${row.depth * 24}px` }}
            py="sm"
            borderBottom="1px solid"
            borderColor="grey20"
          >
            <Text style={{ minWidth: '280px' }}>{row.name}</Text>

            <Box flex alignItems="center" style={{ gap: '6px' }}>
              <CheckBox
                id={`nav-${row.id}`}
                checked={row.showInNav}
                disabled={savingId === row.id}
                onChange={() => saveField(row.id, { showInNav: !row.showInNav })}
              />
              <Label htmlFor={`nav-${row.id}`} style={{ margin: 0 }}>
                Show in nav
              </Label>
            </Box>

            <Box flex alignItems="center" style={{ gap: '6px' }}>
              <Label htmlFor={`order-${row.id}`} style={{ margin: 0 }}>
                Order
              </Label>
              <input
                id={`order-${row.id}`}
                type="number"
                defaultValue={row.navOrder}
                disabled={savingId === row.id}
                style={{ width: '64px' }}
                onBlur={(event) => {
                  const value = Number(event.currentTarget.value);
                  if (Number.isFinite(value) && value !== row.navOrder) {
                    saveField(row.id, { navOrder: value });
                  }
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>

      <Button mt="lg" onClick={() => window.location.assign('/admin/resources/Category/actions/new')}>
        <Icon icon="Add" mr="default" />
        New category
      </Button>
    </Box>
  );
};

export default CategoryTree;
