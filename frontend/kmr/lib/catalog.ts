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

export function resolveCatalog(
  products: Product[],
  categories: Category[],
  params: CatalogSearchParams
): ResolvedCatalog {
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));
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
    categoryCounts.set(
      category.slug,
      bySearch.filter((p) => p.categoryId === category.id).length
    );
  }

  const selectedCategoryIds = selectedCategorySlugs.map(
    (slug) => categoryIdBySlug.get(slug)!
  );
  const byCategory = selectedCategoryIds.length
    ? bySearch.filter((p) => selectedCategoryIds.includes(p.categoryId))
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
