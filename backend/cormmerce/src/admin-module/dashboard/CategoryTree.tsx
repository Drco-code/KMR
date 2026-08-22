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
  const [history, setHistory] = useState<CategoryRow[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function load() {
    api
      .getPage<CategoryRow[]>({ pageName: 'categoryTree' })
      .then((response) => {
        setCategories(response.data);
        setHistory([response.data]);
        setHistoryIndex(0);
      })
      .catch(() => setLoadError('Could not load categories.'));
  }

  useEffect(load, []);

  function pushHistory(newCats: CategoryRow[]) {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newCats]);
    setHistoryIndex(updatedHistory.length);
  }

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
      setSaveError(null);
    } catch {
      setSaveError('Failed to save changes — please retry.');
    } finally {
      setSavingId(null);
    }
  }

  // Safe sibling reordering only (cannot corrupt hierarchy/levels)
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

    // Safety: only allow reordering within the same parent level
    if (sourceCat.parentId !== targetCat.parentId) {
      setSaveError('You can only drag to reorder categories within the same level/section.');
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Get all siblings in this parent group
    const siblings = categories
      .filter((c) => c.parentId === sourceCat.parentId && c.id !== sourceCat.id)
      .sort((a, b) => a.navOrder - b.navOrder || a.name.localeCompare(b.name));

    const targetIndex = siblings.findIndex((c) => c.id === targetId);
    const insertIndex = targetIndex >= 0 ? targetIndex : siblings.length;

    // Insert sourceCat at the target index
    siblings.splice(insertIndex, 0, sourceCat);

    // Assign sequential navOrders (0, 10, 20, 30...) to prevent collisions
    const updatedCategories = categories.map((c) => {
      const idx = siblings.findIndex((s) => s.id === c.id);
      if (idx !== -1) {
        return { ...c, navOrder: idx * 10 };
      }
      return c;
    });

    setCategories(updatedCategories);
    pushHistory(updatedCategories);
    setDraggedId(null);
    setDragOverId(null);

    // Save the new order
    const newOrder = insertIndex * 10;
    await saveField(sourceCat.id, { navOrder: newOrder });
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

    const updated = categories.map((c) => (c.id === id ? { ...c, navOrder: newOrder } : c));
    setCategories(updated);
    pushHistory(updated);

    await saveField(id, { navOrder: newOrder });
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

    const updated = categories.map((c) => (c.id === id ? { ...c, navOrder: newOrder } : c));
    setCategories(updated);
    pushHistory(updated);

    await saveField(id, { navOrder: newOrder });
  }

  // Undo
  async function handleUndo() {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    const prevCats = history[prevIndex];
    setHistoryIndex(prevIndex);
    setCategories(prevCats);

    // Save orders from prev state
    for (const cat of prevCats) {
      const curr = categories?.find((c) => c.id === cat.id);
      if (curr && (curr.navOrder !== cat.navOrder || curr.parentId !== cat.parentId)) {
        await saveField(cat.id, { navOrder: cat.navOrder, parentId: cat.parentId });
      }
    }
  }

  // Redo
  async function handleRedo() {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    const nextCats = history[nextIndex];
    setHistoryIndex(nextIndex);
    setCategories(nextCats);

    for (const cat of nextCats) {
      const curr = categories?.find((c) => c.id === cat.id);
      if (curr && (curr.navOrder !== cat.navOrder || curr.parentId !== cat.parentId)) {
        await saveField(cat.id, { navOrder: cat.navOrder, parentId: cat.parentId });
      }
    }
  }

  // Reload / Reset from database
  function handleReset() {
    load();
    setSuccessMessage('Category hierarchy reloaded and refreshed from database.');
    setTimeout(() => setSuccessMessage(null), 4000);
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

      {successMessage && (
        <Box mb="lg">
          <MessageBox message={successMessage} variant="success">
            <Button onClick={() => setSuccessMessage(null)}>Dismiss</Button>
          </MessageBox>
        </Box>
      )}

      <Box mb="lg" flex justifyContent="space-between" alignItems="flex-start">
        <Box>
          <H2 fontWeight="bold" mb="xs">
            Interactive Category Navigation Tree
          </H2>
          <Text color="grey60" mb="sm">
            <strong>Drag and drop</strong> or use <strong>↑ / ↓</strong> to arrange categories.
            Dragging is safely locked to the same level to preserve structure.
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

        {/* Toolbar: Undo, Redo, Reset */}
        <Box flex style={{ gap: '8px' }}>
          <Button
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            style={{ opacity: historyIndex <= 0 ? 0.5 : 1 }}
          >
            ↩ Undo
          </Button>
          <Button
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            style={{ opacity: historyIndex >= history.length - 1 ? 0.5 : 1 }}
          >
            ↪ Redo
          </Button>
          <Button size="sm" variant="danger" onClick={handleReset}>
            🔄 Refresh / Reset
          </Button>
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
                    onChange={() => {
                      const updated = categories.map((c) => (c.id === row.id ? { ...c, showInNav: !row.showInNav } : c));
                      setCategories(updated);
                      pushHistory(updated);
                      saveField(row.id, { showInNav: !row.showInNav });
                    }}
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
                        const updated = categories.map((c) => (c.id === row.id ? { ...c, navOrder: value } : c));
                        setCategories(updated);
                        pushHistory(updated);
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
