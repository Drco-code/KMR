"use client";

import { useMemo, useState } from "react";
import { resolveCatalog, VALID_SORTS, type CatalogSearchParams, type CatalogSort } from "@/lib/catalog";
import { CategorySidebarFilter } from "@/components/category-sidebar-filter";
import { SortSelect } from "@/components/sort-select";
import { ProductGrid } from "@/components/product-grid";
import { PaginationNav } from "@/components/pagination-nav";
import { ConsultancyBanner } from "@/components/consultancy-banner";
import { TextReveal } from "@/components/text-reveal";
import type { Category, Product } from "@/lib/api/types";

// Filters/sort/pagination are all derived from data already sitting in
// memory (`products`/`categories`, fetched once by the server page). Doing
// this client-side keeps every checkbox/sort/page interaction instant —
// previously each one went through router.push, which re-ran the server
// page and re-fetched the whole catalog (cache: "no-store") before the
// in-memory filtering even ran.
export function CatalogView({
  heading,
  intro,
  products,
  categories,
  searchParams,
}: {
  heading: string;
  intro: string;
  products: Product[];
  categories: Category[];
  searchParams: CatalogSearchParams;
}) {
  const [category, setCategory] = useState(searchParams.category ?? "");
  const [sort, setSort] = useState<CatalogSort>(
    VALID_SORTS.includes(searchParams.sort as CatalogSort)
      ? (searchParams.sort as CatalogSort)
      : "featured"
  );
  const [page, setPage] = useState(Number(searchParams.page ?? "1") || 1);
  const q = searchParams.q ?? "";

  const resolved = useMemo(
    () => resolveCatalog(products, categories, { q, category, sort, page: String(page) }),
    [products, categories, q, category, sort, page]
  );

  function updateUrl(nextCategory: string, nextSort: CatalogSort, nextPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextCategory) params.set("category", nextCategory);
    if (nextSort !== "featured") params.set("sort", nextSort);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/catalog?${qs}` : "/catalog");
  }

  function handleCategoryToggle(slug: string) {
    const current = category ? category.split(",").filter(Boolean) : [];
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    const nextCategory = next.join(",");
    setCategory(nextCategory);
    setPage(1);
    updateUrl(nextCategory, sort, 1);
  }

  function handleSortChange(nextSort: CatalogSort) {
    setSort(nextSort);
    setPage(1);
    updateUrl(category, nextSort, 1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    updateUrl(category, sort, nextPage);
  }

  const emptyMessage = resolved.query
    ? `No products match "${q}". Try a different search.`
    : resolved.selectedCategorySlugs.length > 0
      ? "No products found for the selected categories."
      : undefined;

  return (
    <div className="flex flex-col gap-10 px-6 py-16 md:px-20 md:py-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            {resolved.query ? "Search Results" : "Full Range"}
          </span>
          <TextReveal as="h1" className="font-display text-4xl text-ink md:text-5xl">
            {resolved.query ? `"${q}"` : heading}
          </TextReveal>
          <p className="max-w-2xl text-ink-muted">{intro}</p>
        </div>
        <SortSelect sort={resolved.sort} onChange={handleSortChange} />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <aside>
          <CategorySidebarFilter
            categories={categories}
            categoryCounts={resolved.categoryCounts}
            selectedSlugs={resolved.selectedCategorySlugs}
            onToggle={handleCategoryToggle}
          />
        </aside>

        <div className="flex flex-col gap-10">
          <ProductGrid
            products={resolved.pageProducts}
            categories={categories}
            emptyMessage={emptyMessage}
          />
          <PaginationNav
            currentPage={resolved.currentPage}
            totalPages={resolved.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <ConsultancyBanner />
    </div>
  );
}
