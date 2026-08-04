import type { Category } from "@/lib/api/types";

export interface CategoryGroup {
  category: Category;
  children: Category[];
}

export interface MegaMenuColumn {
  category: Category;
  items: Category[];
}

// Groups categories into a 2-level tree: top-level categories (parentId
// null) become columns; any categories with parentId set become that
// column's children. A top-level category with no children is just a
// normal standalone browsable category, not a group header.
export function buildCategoryGroups(categories: Category[]): CategoryGroup[] {
  const byParent = new Map<string, Category[]>();
  for (const category of categories) {
    if (category.parentId) {
      const siblings = byParent.get(category.parentId) ?? [];
      siblings.push(category);
      byParent.set(category.parentId, siblings);
    }
  }

  return categories
    .filter((category) => !category.parentId)
    .map((category) => ({
      category,
      children: byParent.get(category.id) ?? [],
    }));
}

// Builds the column layout for a top-level nav item's mega menu: the root
// category's direct children become column headers, and each of those
// children's children become the items listed under that column.
export function buildMegaMenuTree(categories: Category[], rootId: string): MegaMenuColumn[] {
  const byParent = new Map<string, Category[]>();
  for (const category of categories) {
    if (category.parentId) {
      const siblings = byParent.get(category.parentId) ?? [];
      siblings.push(category);
      byParent.set(category.parentId, siblings);
    }
  }

  const columns = byParent.get(rootId) ?? [];
  return columns.map((category) => ({
    category,
    items: byParent.get(category.id) ?? [],
  }));
}

// Finds a top-level category by its slug (used to look up the root id for
// each nav item's mega menu).
export function findRootCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  return categories.find((category) => !category.parentId && category.slug === slug);
}
