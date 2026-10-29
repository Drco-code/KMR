import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/api/client";
import { CatalogView } from "@/components/catalog-view";
import { JsonLd } from "@/components/json-ld";
import { resolveCatalog, type CatalogSearchParams } from "@/lib/catalog";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "seo" });

  // Sorted, searched or paginated views are the same products in a different
  // order, so they're kept out of the index and point their canonical at the
  // clean catalog URL.
  const filtered = Boolean(query.q || query.category || query.sort || query.page);

  return pageMetadata({
    locale,
    path: "/catalog",
    title: t("catalogTitle"),
    description: t("catalogDescription"),
    noindex: filtered,
  });
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const { locale } = await params;
  const [resolvedSearchParams, t, tNav] = await Promise.all([
    searchParams,
    getTranslations({ locale, namespace: "catalog" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // The same resolution the client component does, so the ItemList structured
  // data matches the products actually rendered.
  const visible = resolveCatalog(products, categories, resolvedSearchParams).pageProducts;
  const crumbs = [
    { name: tNav("home"), path: "/" },
    { name: tNav("allProducts"), path: "/catalog" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, crumbs)} />
      <JsonLd
        data={collectionPageSchema({
          locale,
          path: "/catalog",
          name: t("heading"),
          description: t("intro"),
          products: visible,
        })}
      />
      <CatalogView
        key={JSON.stringify(resolvedSearchParams)}
        heading={t("heading")}
        intro={t("intro")}
        products={products}
        categories={categories}
        searchParams={resolvedSearchParams}
        breadcrumbs={crumbs}
      />
    </>
  );
}
