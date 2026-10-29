import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
} from "@/lib/api/client";
import { CatalogView } from "@/components/catalog-view";
import { JsonLd } from "@/components/json-ld";
import { resolveCatalog, type CatalogSearchParams } from "@/lib/catalog";
import { getCategoryBreadcrumbs } from "@/lib/category-tree";
import { categoryDescription } from "@/lib/category-copy";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema";
import { pageMetadata, plainText } from "@/lib/seo";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; categorySlug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const [{ locale, categorySlug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(decodeURIComponent(categorySlug)).catch(() => null);
  if (!category) return {};

  const description = plainText(categoryDescription(category.slug, category.name), 155);

  return pageMetadata({
    locale,
    path: `/catalog/${category.slug}`,
    title: `${category.name} in Ghana`,
    description,
    noindex: Boolean(query.q || query.category || query.sort || query.page),
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; categorySlug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const [{ locale, categorySlug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const decodedSlug = decodeURIComponent(categorySlug);
  const category = await getCategoryBySlug(decodedSlug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const catalogSearchParams = {
    ...resolvedSearchParams,
    category: resolvedSearchParams.category ?? category.slug,
  };

  const trail = getCategoryBreadcrumbs(categories, category);
  const intro = categoryDescription(category.slug, category.name);

  const crumbs = [
    { name: tNav("home"), path: "/" },
    { name: tNav("allProducts"), path: "/catalog" },
    ...trail.map((item) => ({
      name: item.name,
      path: `/catalog/${item.slug}`,
    })),
  ];

  const visible = resolveCatalog(products, categories, catalogSearchParams).pageProducts;

  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, crumbs)} />
      <JsonLd
        data={collectionPageSchema({
          locale,
          path: `/catalog/${category.slug}`,
          name: category.name,
          description: intro,
          products: visible,
        })}
      />
      <CatalogView
        key={JSON.stringify(catalogSearchParams)}
        heading={category.name}
        intro={intro}
        products={products}
        categories={categories}
        searchParams={catalogSearchParams}
        breadcrumbs={crumbs}
      />
    </>
  );
}
