import type { Category } from "@/lib/api/types";

export interface CategoryGroup {
  category: Category;
  children: Category[];
}

export interface MegaMenuColumn {
  category: Category;
  items: Category[];
}

function navSort(a: Category, b: Category): number {
  return a.navOrder - b.navOrder || a.name.localeCompare(b.name);
}

// Groups categories into a 2-level tree: top-level categories (parentId
// null) become columns; any categories with parentId set become that
// column's children. A top-level category with no children is just a
// normal standalone browsable category, not a group header. Only
// categories with showInNav: true are eligible at any level, and siblings
// are ordered by navOrder (then name as a tiebreaker).
export function buildCategoryGroups(categories: Category[]): CategoryGroup[] {
  const visible = categories.filter((c) => c.showInNav);
  const byParent = new Map<string, Category[]>();
  for (const category of visible) {
    if (category.parentId) {
      const siblings = byParent.get(category.parentId) ?? [];
      siblings.push(category);
      byParent.set(category.parentId, siblings);
    }
  }
  for (const siblings of byParent.values()) siblings.sort(navSort);

  return visible
    .filter((category) => !category.parentId)
    .sort(navSort)
    .map((category) => ({
      category,
      children: byParent.get(category.id) ?? [],
    }));
}

// Builds the column layout for a top-level nav item's mega menu: the root
// category's direct children become column headers, and each of those
// children's children become the items listed under that column. Only
// categories with showInNav: true are included, ordered by navOrder.
export function buildMegaMenuTree(categories: Category[], rootId: string): MegaMenuColumn[] {
  const visible = categories.filter((c) => c.showInNav);
  const byParent = new Map<string, Category[]>();
  for (const category of visible) {
    if (category.parentId) {
      const siblings = byParent.get(category.parentId) ?? [];
      siblings.push(category);
      byParent.set(category.parentId, siblings);
    }
  }
  for (const siblings of byParent.values()) siblings.sort(navSort);

  const columns = byParent.get(rootId) ?? [];
  return columns.map((category) => ({
    category,
    items: byParent.get(category.id) ?? [],
  }));
}

// Finds a top-level category by its slug (used to look up the root id for
// each nav item's mega menu). The root itself must have showInNav: true, 
// if staff hide a nav item's root category, the whole nav item disappears
// (mega-menu.tsx falls back to a plain "/catalog" link when this returns
// undefined).
export function findRootCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  return categories.find((category) => category.showInNav && !category.parentId && category.slug === slug);
}
