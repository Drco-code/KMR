import React, { useEffect, useState, useRef } from 'react';
import { ApiClient } from 'adminjs';
import { Box, Button, CheckBox, H2, Icon, Label, Loader, MessageBox, Text, Badge } from '@adminjs/design-system';

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
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function load() {
    api
      .getPage<CategoryRow[]>({ pageName: 'categoryTree' })
      .then((response) => setCategories(response.data))
      .catch(() => setLoadError('Could not load categories.'));
  }

  useEffect(load, []);

  async function saveField(id: string, data: Partial<Pick<CategoryRow, 'showInNav' | 'navOrder' | 'parentId'>>) {
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
      setSaveError(null);
    } catch {
      setSaveError('Failed to save changes — please retry.');
    } finally {
      setSavingId(null);
    }
  }

  // Reorder siblings when dragging and dropping
  async function handleDrop(targetId: string) {
    if (!categories || !draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const sourceCat = categories.find((c) => c.id === draggedId);
    const targetCat = categories.find((c) => c.id === targetId);

    if (!sourceCat || !targetCat) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Get all siblings in the target's parent group
    const siblings = categories
      .filter((c) => c.parentId === targetCat.parentId && c.id !== sourceCat.id)
      .sort((a, b) => a.navOrder - b.navOrder || a.name.localeCompare(b.name));

    const targetIndex = siblings.findIndex((c) => c.id === targetId);
    const insertIndex = targetIndex >= 0 ? targetIndex : siblings.length;

    // Insert sourceCat at the target index
    siblings.splice(insertIndex, 0, { ...sourceCat, parentId: targetCat.parentId });

    // Assign sequential navOrders (0, 10, 20, 30...) to prevent collisions
    const updatedCategories = categories.map((c) => {
      const idx = siblings.findIndex((s) => s.id === c.id);
      if (idx !== -1) {
        return { ...c, parentId: targetCat.parentId, navOrder: idx * 10 };
      }
      return c;
    });

    setCategories(updatedCategories);
    setDraggedId(null);
    setDragOverId(null);

    // Persist new navOrder and parentId
    const newOrder = insertIndex * 10;
    await saveField(sourceCat.id, {
      navOrder: newOrder,
      parentId: targetCat.parentId,
    });
  }

  // Move up within sibling group
  async function moveUp(id: string) {
    if (!categories) return;
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    const siblings = categories
      .filter((c) => c.parentId === cat.parentId)
      .sort((a, b) => a.navOrder - b.navOrder || a.name.localeCompare(b.name));

    const index = siblings.findIndex((s) => s.id === id);
    if (index <= 0) return; // Already at the top

    const prevSibling = siblings[index - 1];
    const newOrder = Math.max(0, prevSibling.navOrder - 1);

    await saveField(id, { navOrder: newOrder });
    setCategories((current) =>
      (current ?? []).map((c) => (c.id === id ? { ...c, navOrder: newOrder } : c)),
    );
  }

  // Move down within sibling group
  async function moveDown(id: string) {
    if (!categories) return;
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    const siblings = categories
      .filter((c) => c.parentId === cat.parentId)
      .sort((a, b) => a.navOrder - b.navOrder || a.name.localeCompare(b.name));

    const index = siblings.findIndex((s) => s.id === id);
    if (index < 0 || index >= siblings.length - 1) return; // Already at the bottom

    const nextSibling = siblings[index + 1];
    const newOrder = nextSibling.navOrder + 1;

    await saveField(id, { navOrder: newOrder });
    setCategories((current) =>
      (current ?? []).map((c) => (c.id === id ? { ...c, navOrder: newOrder } : c)),
    );
  }

  if (loadError) {
    return (
      <Box p="xl">
        <MessageBox message={loadError} variant="danger" />
      </Box>
    );
  }

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
      {saveError && (
        <Box mb="lg">
          <MessageBox message={saveError} variant="danger">
            <Button onClick={() => setSaveError(null)}>Dismiss</Button>
          </MessageBox>
        </Box>
      )}

      <Box mb="xl">
        <H2 fontWeight="bold" mb="xs">
          Interactive Category Navigation Tree
        </H2>
        <Text color="grey60" mb="sm">
          <strong>Drag and drop</strong> rows or use the <strong>↑ / ↓ buttons</strong> to arrange categories.
          The order and hierarchy set here controls the storefront navigation bar in real time.
        </Text>
        <Box flex style={{ gap: '12px', marginTop: '8px' }}>
          <Badge variant="primary" style={{ backgroundColor: '#1a2744', color: '#ffffff' }}>
            Level 1: Main Top Navbar
          </Badge>
          <Badge variant="info" style={{ backgroundColor: '#c5a059', color: '#ffffff' }}>
            Level 2: Mega Menu Column
          </Badge>
          <Badge variant="default" style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
            Level 3: Dropdown Item
          </Badge>
        </Box>
      </Box>

      <Box style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {rows.map((row, index) => {
          const isDragging = draggedId === row.id;
          const isDragOver = dragOverId === row.id;

          const levelBadge =
            row.depth === 0 ? (
              <Badge style={{ backgroundColor: '#1a2744', color: '#fff', fontSize: '11px' }}>L1: Navbar</Badge>
            ) : row.depth === 1 ? (
              <Badge style={{ backgroundColor: '#c5a059', color: '#fff', fontSize: '11px' }}>L2: Column</Badge>
            ) : (
              <Badge style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '11px' }}>L3: Item</Badge>
            );

          return (
            <Box
              key={row.id}
              draggable
              onDragStart={(e) => {
                setDraggedId(row.id);
                e.dataTransfer.setData('text/plain', row.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverId !== row.id) setDragOverId(row.id);
              }}
              onDragLeave={() => {
                if (dragOverId === row.id) setDragOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(row.id);
              }}
              flex
              alignItems="center"
              justifyContent="space-between"
              py="sm"
              px="md"
              style={{
                gap: '12px',
                paddingLeft: `${16 + row.depth * 28}px`,
                backgroundColor: isDragging ? '#eff6ff' : isDragOver ? '#fef3c7' : index % 2 === 0 ? '#ffffff' : '#f8fafc',
                borderBottom: '1px solid #f1f5f9',
                borderTop: isDragOver ? '2px solid #c5a059' : 'none',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Box flex alignItems="center" style={{ gap: '10px', flex: 1, minWidth: 0 }}>
                {/* Drag Grip Handle */}
                <span style={{ cursor: 'grab', color: '#94a3b8', fontSize: '16px', userSelect: 'none' }} title="Drag to reorder">
                  ⋮⋮
                </span>

                {levelBadge}

                <Text style={{ fontWeight: row.depth === 0 ? 'bold' : row.depth === 1 ? '600' : 'normal', color: '#1e293b' }}>
                  {row.name}
                </Text>
              </Box>

              <Box flex alignItems="center" style={{ gap: '16px' }}>
                {/* Move Up / Move Down Quick Buttons */}
                <Box flex style={{ gap: '4px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveUp(row.id);
                    }}
                    disabled={savingId === row.id}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveDown(row.id);
                    }}
                    disabled={savingId === row.id}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    title="Move down"
                  >
                    ↓
                  </button>
                </Box>

                {/* Show in Nav Checkbox */}
                <Box flex alignItems="center" style={{ gap: '6px' }}>
                  <CheckBox
                    id={`nav-${row.id}`}
                    checked={row.showInNav}
                    disabled={savingId === row.id}
                    onChange={() => saveField(row.id, { showInNav: !row.showInNav })}
                  />
                  <Label htmlFor={`nav-${row.id}`} style={{ margin: 0, fontSize: '12px' }}>
                    Show in nav
                  </Label>
                </Box>

                {/* Order Input */}
                <Box flex alignItems="center" style={{ gap: '6px' }}>
                  <Label htmlFor={`order-${row.id}`} style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Order:
                  </Label>
                  <input
                    id={`order-${row.id}`}
                    type="number"
                    defaultValue={row.navOrder}
                    key={row.navOrder}
                    disabled={savingId === row.id}
                    style={{
                      width: '52px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      textAlign: 'center',
                    }}
                    onBlur={(event) => {
                      const value = Number(event.currentTarget.value);
                      if (Number.isFinite(value) && value !== row.navOrder) {
                        saveField(row.id, { navOrder: value });
                      }
                    }}
                  />
                </Box>

                {/* Edit Link */}
                <a
                  href={`/admin/resources/Category/records/${row.id}/edit`}
                  style={{
                    fontSize: '12px',
                    color: '#2563eb',
                    textDecoration: 'underline',
                    padding: '2px 6px',
                  }}
                >
                  Edit
                </a>
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box mt="lg" flex justifyContent="space-between" alignItems="center">
        <Button onClick={() => window.location.assign('/admin/resources/Category/actions/new')}>
          <Icon icon="Add" mr="default" />
          New Category
        </Button>
        <Text color="grey60" style={{ fontSize: '12px' }}>
          Total Categories: {categories.length}
        </Text>
      </Box>
    </Box>
  );
};

export default CategoryTree;
