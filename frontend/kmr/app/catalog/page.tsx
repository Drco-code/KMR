import { getCategories, getProducts } from "@/lib/api/client";
import { CatalogView } from "@/components/catalog-view";
import type { CatalogSearchParams } from "@/lib/catalog";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <CatalogView
      heading="Expanded Hardware & Paint Collection"
      intro="Our complete professional ecosystem. From artisanal pigments to precision hardware for the architectural visionary."
      products={products}
      categories={categories}
      searchParams={resolvedSearchParams}
    />
  );
}
