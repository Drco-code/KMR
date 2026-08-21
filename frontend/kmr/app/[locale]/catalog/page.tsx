import { getCategories, getProducts } from "@/lib/api/client";
import { CatalogView } from "@/components/catalog-view";
import { getTranslations } from "next-intl/server";
import type { CatalogSearchParams } from "@/lib/catalog";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations("catalog");
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <CatalogView
      key={JSON.stringify(resolvedSearchParams)}
      heading={t("heading")}
      intro={t("intro")}
      products={products}
      categories={categories}
      searchParams={resolvedSearchParams}
    />
  );
}
