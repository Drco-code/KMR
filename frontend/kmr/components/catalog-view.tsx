import { Suspense } from "react";
import { resolveCatalog, type CatalogSearchParams } from "@/lib/catalog";
import { CategorySidebarFilter } from "@/components/category-sidebar-filter";
import { SortSelect } from "@/components/sort-select";
import { ProductGrid } from "@/components/product-grid";
import { PaginationNav } from "@/components/pagination-nav";
import { ConsultancyBanner } from "@/components/consultancy-banner";
import type { Category, Product } from "@/lib/api/types";

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
  const resolved = resolveCatalog(products, categories, searchParams);

  const urlSearchParams = new URLSearchParams();
  if (searchParams.q) urlSearchParams.set("q", searchParams.q);
  if (searchParams.category) urlSearchParams.set("category", searchParams.category);
  if (searchParams.sort) urlSearchParams.set("sort", searchParams.sort);

  const emptyMessage = resolved.query
    ? `No products match "${searchParams.q}". Try a different search.`
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
          <h1 className="font-display text-4xl text-ink md:text-5xl">
            {resolved.query ? `"${searchParams.q}"` : heading}
          </h1>
          <p className="max-w-2xl text-ink-muted">{intro}</p>
        </div>
        <Suspense fallback={null}>
          <SortSelect sort={resolved.sort} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <aside>
          <Suspense fallback={null}>
            <CategorySidebarFilter
              categories={categories}
              categoryCounts={resolved.categoryCounts}
              selectedSlugs={resolved.selectedCategorySlugs}
            />
          </Suspense>
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
            searchParams={urlSearchParams}
          />
        </div>
      </div>

      <ConsultancyBanner />
    </div>
  );
}
