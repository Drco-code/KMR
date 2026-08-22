import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
} from "@/lib/api/client";
import { CatalogView } from "@/components/catalog-view";
import type { CatalogSearchParams } from "@/lib/catalog";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; categorySlug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const { categorySlug } = await params;
  const decodedSlug = decodeURIComponent(categorySlug);
  const category = await getCategoryBySlug(decodedSlug);
  if (!category) notFound();

  const resolvedSearchParams = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const catalogSearchParams = {
    ...resolvedSearchParams,
    category: resolvedSearchParams.category ?? category.slug,
  };

  return (
    <CatalogView
      key={JSON.stringify(catalogSearchParams)}
      heading={category.name}
      intro={`Browse the ${category.name} collection from our complete professional ecosystem.`}
      products={products}
      categories={categories}
      searchParams={catalogSearchParams}
    />
  );
}
