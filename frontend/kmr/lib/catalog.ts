import type { Category, Product } from "@/lib/api/types";

export const CATALOG_PAGE_SIZE = 8;

export type CatalogSort = "featured" | "name-asc" | "name-desc";

export interface CatalogSearchParams {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
}

export interface ResolvedCatalog {
  pageProducts: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  selectedCategorySlugs: string[];
  categoryCounts: Map<string, number>;
  query: string;
  sort: CatalogSort;
}

// Category is a self-referential tree (see backend schema.prisma), and a
// product is filed under exactly one category via Product.categoryId — a
// leaf category most of the time, but nothing stops staff from assigning
// it to a parent "group header" category either. Browsing a parent
// category should show everything filed under it OR any of its
// descendants, not just products filed on that exact row — otherwise a
// product assigned one level off from where a visitor expects it to be
// filed just silently disappears from both listings. This builds, for
// every category, the set of its own id plus every descendant's id.
function buildDescendantIdSets(categories: Category[]): Map<string, Set<string>> {
  const childrenByParent = new Map<string, Category[]>();
  for (const category of categories) {
    if (category.parentId) {
      const siblings = childrenByParent.get(category.parentId) ?? [];
      siblings.push(category);
      childrenByParent.set(category.parentId, siblings);
    }
  }

  const result = new Map<string, Set<string>>();
  function collect(categoryId: string): Set<string> {
    const cached = result.get(categoryId);
    if (cached) return cached;

    const ids = new Set<string>([categoryId]);
    result.set(categoryId, ids); // set before recursing to guard against cyclical data
    for (const child of childrenByParent.get(categoryId) ?? []) {
      for (const id of collect(child.id)) ids.add(id);
    }
    return ids;
  }

  for (const category of categories) collect(category.id);
  return result;
}

export function resolveCatalog(
  products: Product[],
  categories: Category[],
  params: CatalogSearchParams
): ResolvedCatalog {
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const descendantIdsByCategoryId = buildDescendantIdSets(categories);
  const selectedCategorySlugs = (params.category ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && categoryIdBySlug.has(s));

  const query = (params.q ?? "").trim().toLowerCase();
  const bySearch = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      )
    : products;

  const categoryCounts = new Map<string, number>();
  for (const category of categories) {
    const treeIds = descendantIdsByCategoryId.get(category.id)!;
    categoryCounts.set(
      category.slug,
      bySearch.filter((p) => treeIds.has(p.categoryId)).length
    );
  }

  const selectedCategoryIds = new Set(
    selectedCategorySlugs.flatMap((slug) => {
      const id = categoryIdBySlug.get(slug)!;
      return [...(descendantIdsByCategoryId.get(id) ?? [id])];
    })
  );
  const byCategory = selectedCategoryIds.size
    ? bySearch.filter((p) => selectedCategoryIds.has(p.categoryId))
    : bySearch;

  const sort: CatalogSort =
    params.sort === "name-asc" || params.sort === "name-desc"
      ? params.sort
      : "featured";

  const sorted =
    sort === "featured"
      ? byCategory
      : [...byCategory].sort((a, b) =>
          sort === "name-asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / CATALOG_PAGE_SIZE));
  const requestedPage = Number(params.page ?? "1");
  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;

  const start = (currentPage - 1) * CATALOG_PAGE_SIZE;
  const pageProducts = sorted.slice(start, start + CATALOG_PAGE_SIZE);

  return {
    pageProducts,
    totalCount,
    totalPages,
    currentPage,
    selectedCategorySlugs,
    categoryCounts,
    query,
    sort,
  };
}
