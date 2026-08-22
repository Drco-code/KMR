import React, { useEffect, useState } from 'react';
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

function buildParentOptions(categories: CategoryRow[], currentId: string) {
  const catMap = new Map<string, CategoryRow>(categories.map((c) => [c.id, c]));

  const descendantIds = new Set<string>();
  function findDescendants(id: string) {
    descendantIds.add(id);
    for (const c of categories) {
      if (c.parentId === id) findDescendants(c.id);
    }
  }
  findDescendants(currentId);

  function getBreadcrumb(c: CategoryRow): string {
    const parts: string[] = [c.name];
    let curr = c;
    while (curr.parentId && catMap.has(curr.parentId)) {
      curr = catMap.get(curr.parentId)!;
      parts.unshift(curr.name);
    }
    return parts.join(' > ');
  }

  const eligible = categories.filter((c) => !descendantIds.has(c.id));
  eligible.sort((a, b) => getBreadcrumb(a).localeCompare(getBreadcrumb(b)));

  return eligible.map((c) => {
    let depth = 0;
    let curr = c;
    while (curr.parentId && catMap.has(curr.parentId)) {
      depth++;
      curr = catMap.get(curr.parentId)!;
    }
    const levelLabel = depth === 0 ? 'Make Level 2 (Under ' + c.name + ')' : depth === 1 ? 'Make Level 3 (Under ' + getBreadcrumb(c) + ')' : 'Under ' + getBreadcrumb(c);
    return {
      id: c.id,
      label: `${levelLabel}`,
      breadcrumb: getBreadcrumb(c),
    };
  });
}

const CategoryTree: React.FC = () => {
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);
  const [savedBaseline, setSavedBaseline] = useState<CategoryRow[] | null>(null);
  const [history, setHistory] = useState<CategoryRow[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function load() {
    api
      .getPage<CategoryRow[]>({ pageName: 'categoryTree' })
      .then((response) => {
        setCategories(response.data);
        setSavedBaseline(response.data);
        setHistory([response.data]);
        setHistoryIndex(0);
      })
      .catch(() => setLoadError('Could not load categories.'));
  }

  useEffect(load, []);

  // Compute how many items have pending changes compared to saved baseline
  const dirtyCount = React.useMemo(() => {
    if (!categories || !savedBaseline) return 0;
    let count = 0;
    for (const c of categories) {
      const orig = savedBaseline.find((b) => b.id === c.id);
      if (!orig || orig.parentId !== c.parentId || orig.navOrder !== c.navOrder || orig.showInNav !== c.showInNav) {
        count++;
      }
    }
    return count;
  }, [categories, savedBaseline]);

  function pushHistory(newCats: CategoryRow[]) {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newCats]);
    setHistoryIndex(updatedHistory.length);
  }

  // Save all modified categories to the server
  async function handleSaveAll() {
    if (!categories || isSavingAll) return;
    setIsSavingAll(true);
    setSaveError(null);

    try {
      const toSave = categories.filter((c) => {
        const orig = savedBaseline?.find((b) => b.id === c.id);
        return !orig || orig.parentId !== c.parentId || orig.navOrder !== c.navOrder || orig.showInNav !== c.showInNav;
      });

      for (const cat of toSave) {
        await api.recordAction({
          resourceId: 'Category',
          recordId: cat.id,
          actionName: 'edit',
          method: 'post',
          data: {
            parentId: cat.parentId,
            navOrder: cat.navOrder,
            showInNav: cat.showInNav,
          },
        });
      }

      setSavedBaseline(categories);
      setSuccessMessage('All category tree changes saved successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setSaveError('Failed to save some changes. Please try clicking Save again.');
    } finally {
      setIsSavingAll(false);
    }
  }

  // Change category parent and level directly
  async function handleChangeParent(id: string, newParentId: string | null) {
    if (!categories) return;
    const cat = categories.find((c) => c.id === id);
    if (!cat || cat.parentId === newParentId) {
      setEditingParentId(null);
      return;
    }

    const updated = categories.map((c) => (c.id === id ? { ...c, parentId: newParentId } : c));
    setCategories(updated);
    pushHistory(updated);
    setEditingParentId(null);

    // Auto-save immediately to guarantee persistence
    try {
      await api.recordAction({
        resourceId: 'Category',
        recordId: id,
        actionName: 'edit',
        method: 'post',
        data: { parentId: newParentId },
      });
      setSavedBaseline((prev) => (prev ?? []).map((c) => (c.id === id ? { ...c, parentId: newParentId } : c)));
      setSuccessMessage(`Level updated and saved for "${cat.name}".`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setSaveError(`Failed to auto-save level for "${cat.name}". Please click "Save Changes".`);
    }
  }

  // Promote level (Move up one level: Level 3 -> Level 2, Level 2 -> Level 1)
  async function promoteLevel(id: string) {
    if (!categories) return;
    const cat = categories.find((c) => c.id === id);
    if (!cat || !cat.parentId) return;

    const parentCat = categories.find((c) => c.id === cat.parentId);
    const newParentId = parentCat ? parentCat.parentId : null;

    const updated = categories.map((c) => (c.id === id ? { ...c, parentId: newParentId } : c));
    setCategories(updated);
    pushHistory(updated);

    try {
      await api.recordAction({
        resourceId: 'Category',
        recordId: id,
        actionName: 'edit',
        method: 'post',
        data: { parentId: newParentId },
      });
      setSavedBaseline((prev) => (prev ?? []).map((c) => (c.id === id ? { ...c, parentId: newParentId } : c)));
      setSuccessMessage(`Promoted and saved "${cat.name}".`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setSaveError(`Failed to auto-save promotion for "${cat.name}". Please click "Save Changes".`);
    }
  }

  // Sibling drag and drop
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

    if (sourceCat.parentId !== targetCat.parentId) {
      setSaveError('Drag to reorder within the same section. To change levels, use the "⚡ Change Level" button.');
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const siblings = categories
      .filter((c) => c.parentId === sourceCat.parentId && c.id !== sourceCat.id)
      .sort((a, b) => a.navOrder - b.navOrder || a.name.localeCompare(b.name));

    const targetIndex = siblings.findIndex((c) => c.id === targetId);
    const insertIndex = targetIndex >= 0 ? targetIndex : siblings.length;

    siblings.splice(insertIndex, 0, sourceCat);

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

    const newOrder = insertIndex * 10;
    try {
      await api.recordAction({
        resourceId: 'Category',
        recordId: sourceCat.id,
        actionName: 'edit',
        method: 'post',
        data: { navOrder: newOrder },
      });
      setSavedBaseline((prev) => (prev ?? []).map((c) => (c.id === sourceCat.id ? { ...c, navOrder: newOrder } : c)));
    } catch {
      setSaveError('Reorder queued — click "Save Changes" to commit.');
    }
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
    if (index <= 0) return;

    const prevSibling = siblings[index - 1];
    const newOrder = Math.max(0, prevSibling.navOrder - 1);

    const updated = categories.map((c) => (c.id === id ? { ...c, navOrder: newOrder } : c));
    setCategories(updated);
    pushHistory(updated);

    try {
      await api.recordAction({
        resourceId: 'Category',
        recordId: id,
        actionName: 'edit',
        method: 'post',
        data: { navOrder: newOrder },
      });
      setSavedBaseline((prev) => (prev ?? []).map((c) => (c.id === id ? { ...c, navOrder: newOrder } : c)));
    } catch {
      setSaveError('Reorder queued — click "Save Changes" to commit.');
    }
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
    if (index < 0 || index >= siblings.length - 1) return;

    const nextSibling = siblings[index + 1];
    const newOrder = nextSibling.navOrder + 1;

    const updated = categories.map((c) => (c.id === id ? { ...c, navOrder: newOrder } : c));
    setCategories(updated);
    pushHistory(updated);

    try {
      await api.recordAction({
        resourceId: 'Category',
        recordId: id,
        actionName: 'edit',
        method: 'post',
        data: { navOrder: newOrder },
      });
      setSavedBaseline((prev) => (prev ?? []).map((c) => (c.id === id ? { ...c, navOrder: newOrder } : c)));
    } catch {
      setSaveError('Reorder queued — click "Save Changes" to commit.');
    }
  }

  // Undo
  function handleUndo() {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    const prevCats = history[prevIndex];
    setHistoryIndex(prevIndex);
    setCategories(prevCats);
  }

  // Redo
  function handleRedo() {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    const nextCats = history[nextIndex];
    setHistoryIndex(nextIndex);
    setCategories(nextCats);
  }

  function handleReset() {
    load();
    setSuccessMessage('Category tree reloaded from database.');
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
            Interactive Category Level & Hierarchy Editor
          </H2>
          <Text color="grey60" mb="sm">
            Easily turn any category into <strong>Level 1 (Top Navbar)</strong>, <strong>Level 2 (Column Header)</strong>, or <strong>Level 3 (Dropdown Item)</strong>.
          </Text>
          <Box flex style={{ gap: '12px', marginTop: '8px' }}>
            <Badge variant="primary" style={{ backgroundColor: '#1a2744', color: '#ffffff' }}>
              Level 1: Main Top Navbar
            </Badge>
            <Badge variant="info" style={{ backgroundColor: '#c5a059', color: '#ffffff' }}>
              Level 2: Mega Menu Column Header
            </Badge>
            <Badge variant="default" style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
              Level 3: Dropdown Item
            </Badge>
          </Box>
        </Box>

        {/* Action Toolbar */}
        <Box flex style={{ gap: '8px', alignItems: 'center' }}>
          {/* Main Save Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={handleSaveAll}
            disabled={isSavingAll}
            style={{
              backgroundColor: dirtyCount > 0 ? '#16a34a' : '#1a2744',
              color: '#ffffff',
              fontWeight: 'bold',
              boxShadow: dirtyCount > 0 ? '0 0 10px rgba(22, 163, 74, 0.4)' : 'none',
            }}
          >
            {isSavingAll ? '💾 Saving...' : dirtyCount > 0 ? `💾 Save Changes (${dirtyCount})` : '💾 Save Changes'}
          </Button>

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
            🔄 Reset
          </Button>
        </Box>
      </Box>

      <Box style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {rows.map((row, index) => {
          const isDragging = draggedId === row.id;
          const isDragOver = dragOverId === row.id;
          const isEditingParent = editingParentId === row.id;

          const levelBadge =
            row.depth === 0 ? (
              <Badge style={{ backgroundColor: '#1a2744', color: '#fff', fontSize: '11px' }}>L1: Navbar</Badge>
            ) : row.depth === 1 ? (
              <Badge style={{ backgroundColor: '#c5a059', color: '#fff', fontSize: '11px' }}>L2: Column</Badge>
            ) : (
              <Badge style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '11px' }}>L3: Item</Badge>
            );

          const parentOptions = isEditingParent ? buildParentOptions(categories, row.id) : [];

          return (
            <Box
              key={row.id}
              draggable={!isEditingParent}
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
              flexDirection="column"
              py="sm"
              px="md"
              style={{
                paddingLeft: `${16 + row.depth * 28}px`,
                backgroundColor: isDragging ? '#eff6ff' : isDragOver ? '#fef3c7' : isEditingParent ? '#f0f9ff' : index % 2 === 0 ? '#ffffff' : '#f8fafc',
                borderBottom: '1px solid #f1f5f9',
                borderTop: isDragOver ? '2px solid #c5a059' : 'none',
                opacity: isDragging ? 0.5 : 1,
                transition: 'background-color 0.15s ease',
              }}
            >
              <Box flex alignItems="center" justifyContent="space-between" style={{ gap: '12px' }}>
                <Box flex alignItems="center" style={{ gap: '10px', flex: 1, minWidth: 0 }}>
                  <span style={{ cursor: 'grab', color: '#94a3b8', fontSize: '16px', userSelect: 'none' }} title="Drag to reorder within level">
                    ⋮⋮
                  </span>

                  {levelBadge}

                  <Text style={{ fontWeight: row.depth === 0 ? 'bold' : row.depth === 1 ? '600' : 'normal', color: '#1e293b' }}>
                    {row.name}
                  </Text>
                </Box>

                <Box flex alignItems="center" style={{ gap: '12px' }}>
                  {/* Promote Level Button */}
                  {row.depth > 0 && (
                    <button
                      type="button"
                      onClick={() => promoteLevel(row.id)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #c5a059',
                        backgroundColor: '#fef9ee',
                        color: '#92600c',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}
                      title="Promote level (e.g. Item -> Column, or Column -> Top Navbar)"
                    >
                      ⮐ Promote
                    </button>
                  )}

                  {/* Level / Parent Switcher Toggle */}
                  <button
                    type="button"
                    onClick={() => setEditingParentId(isEditingParent ? null : row.id)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: isEditingParent ? '#e2e8f0' : '#ffffff',
                      color: '#334155',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}
                    title="Change where this category sits in the hierarchy"
                  >
                    {isEditingParent ? '✕ Close' : '⚡ Change Level'}
                  </button>

                  {/* Move Up / Move Down Quick Buttons */}
                  <Box flex style={{ gap: '4px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveUp(row.id);
                      }}
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
                      onChange={() => {
                        const updated = categories.map((c) => (c.id === row.id ? { ...c, showInNav: !row.showInNav } : c));
                        setCategories(updated);
                        pushHistory(updated);
                      }}
                    />
                    <Label htmlFor={`nav-${row.id}`} style={{ margin: 0, fontSize: '12px' }}>
                      Show in nav
                    </Label>
                  </Box>

                  {/* Edit Resource Link */}
                  <a
                    href={`/admin/resources/Category/records/${row.id}/edit`}
                    style={{
                      fontSize: '12px',
                      color: '#2563eb',
                      textDecoration: 'underline',
                      padding: '2px 4px',
                    }}
                  >
                    Edit
                  </a>
                </Box>
              </Box>

              {/* Inline Level / Parent Selection Panel */}
              {isEditingParent && (
                <Box mt="sm" p="sm" style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #93c5fd' }}>
                  <Text style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '6px' }}>
                    Choose new level / placement for "{row.name}":
                  </Text>
                  <Box flex alignItems="center" style={{ gap: '10px' }}>
                    <select
                      defaultValue={row.parentId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : e.target.value;
                        handleChangeParent(row.id, val);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #94a3b8',
                        fontSize: '12px',
                        minWidth: '320px',
                      }}
                    >
                      <option value="">⭐ Make Level 1 (Main Top Navbar - No Parent)</option>
                      {parentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" onClick={() => setEditingParentId(null)}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Bottom Actions Toolbar */}
      <Box mt="lg" flex justifyContent="space-between" alignItems="center">
        <Box flex style={{ gap: '12px', alignItems: 'center' }}>
          <Button onClick={() => window.location.assign('/admin/resources/Category/actions/new')}>
            <Icon icon="Add" mr="default" />
            New Category
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSaveAll}
            disabled={isSavingAll}
            style={{
              backgroundColor: dirtyCount > 0 ? '#16a34a' : '#1a2744',
              color: '#ffffff',
              fontWeight: 'bold',
            }}
          >
            {isSavingAll ? '💾 Saving...' : dirtyCount > 0 ? `💾 Save Changes (${dirtyCount})` : '💾 Save Changes'}
          </Button>
        </Box>

        <Text color="grey60" style={{ fontSize: '12px' }}>
          Total Categories: {categories.length}
        </Text>
      </Box>
    </Box>
  );
};

export default CategoryTree;
