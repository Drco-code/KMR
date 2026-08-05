export interface CategoryLike {
  id: string;
  name: string;
  parentId: string | null;
}

export interface CategoryOption {
  value: string;
  label: string;
}

// Category is a self-referential tree (parentId), but AdminJS's default
// reference dropdown just lists every Category row flat, sorted however
// the DB returns them — "Power Tool (A-M)" looks identical to any other
// row, with no indication it's a child of "Tools". This builds options
// prefixed with each category's full ancestor chain, e.g.
// "Tools > Power Tool (A-M)", shared by every admin component that needs
// to present the category tree as a flat, disambiguated list.
export function buildBreadcrumbOptions(
  categories: CategoryLike[],
  options?: { excludeIds?: Set<string> },
): CategoryOption[] {
  const byId = new Map(categories.map((c) => [c.id, c]));

  function breadcrumb(category: CategoryLike): string {
    const names: string[] = [];
    let current: CategoryLike | undefined = category;
    const seen = new Set<string>(); // guards against cyclical parentId data
    while (current && !seen.has(current.id)) {
      names.unshift(current.name);
      seen.add(current.id);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return names.join(' > ');
  }

  return categories
    .filter((c) => !options?.excludeIds?.has(c.id))
    .map((c) => ({ value: c.id, label: breadcrumb(c) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// A category can't be its own ancestor. Given a flat category list and a
// record id being edited, returns that id plus every one of its
// descendants — the set that must be excluded from that record's own
// "pick a parent" dropdown to prevent creating a cycle.
export function selfAndDescendantIds(categories: CategoryLike[], id: string): Set<string> {
  const byParent = new Map<string, CategoryLike[]>();
  for (const category of categories) {
    if (category.parentId) {
      const siblings = byParent.get(category.parentId) ?? [];
      siblings.push(category);
      byParent.set(category.parentId, siblings);
    }
  }

  const result = new Set<string>([id]);
  const stack = [id];
  while (stack.length) {
    const current = stack.pop()!;
    for (const child of byParent.get(current) ?? []) {
      if (!result.has(child.id)) {
        result.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return result;
}
