import {
  API_URL,
  getCategories,
  getProducts,
  getSignatureCollections,
} from "@/lib/api/client";
import { absoluteUrl, localizedPath, SITE_URL } from "@/lib/seo";
import { escapeXml, encodePath, categorySlug, productSlug, slugify } from "@/lib/slug";
import { routing } from "@/i18n/routing";

// The catalog API is fetched at request time. Static prerendering would turn
// an API cache/dynamic-server decision into a build failure.
export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/", "/catalog", "/consultancy", "/contact"];

interface SitemapEntry {
  path: string;
  lastModified?: string;
  translatedLocales: readonly string[];
}

function requireCatalogData<T>(label: string, value: T[], url: string): T[] {
  if (value.length === 0) {
    const message = `Sitemap generation aborted: ${label} API response from ${url} was empty.`;
    console.error(message);
    throw new Error(message);
  }
  return value;
}

function validPath(path: string): string | null {
  const encoded = encodePath(path);
  return encoded === "/" || encoded.split("/").every((segment) => segment.length > 0)
    ? encoded
    : null;
}

function languageLinks(entry: SitemapEntry): Record<string, string> {
  const links: Record<string, string> = {};
  for (const locale of entry.translatedLocales) {
    if (!routing.locales.includes(locale as (typeof routing.locales)[number])) continue;
    links[locale] = absoluteUrl(localizedPath(locale, entry.path));
  }
  const defaultUrl = links[routing.defaultLocale];
  if (defaultUrl) links["x-default"] = defaultUrl;
  return links;
}

function renderUrl(entry: SitemapEntry): string {
  const url = absoluteUrl(entry.path);
  const alternates = languageLinks(entry);
  const alternateXml = Object.entries(alternates)
    .map(
      ([locale, href]) =>
        `<xhtml:link rel="alternate" hreflang="${escapeXml(locale)}" href="${escapeXml(href)}"/>`
    )
    .join("");

  return `<url><loc>${escapeXml(url)}</loc>${
    entry.lastModified ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>` : ""
  }${alternateXml}</url>`;
}

export async function GET(): Promise<Response> {
  let catalogData: [
    Awaited<ReturnType<typeof getCategories>>,
    Awaited<ReturnType<typeof getProducts>>,
    Awaited<ReturnType<typeof getSignatureCollections>>,
  ];
  try {
    catalogData = await Promise.all([
      getCategories(),
      getProducts(),
      getSignatureCollections(),
    ]);
  } catch (error) {
    const message = `Sitemap generation aborted: catalog API request failed. ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(message);
    throw new Error(message, { cause: error });
  }

  const [categories, products, collections] = catalogData;
  requireCatalogData("categories", categories, `${API_URL}/category-module`);
  requireCatalogData("products", products, `${API_URL}/product-module`);

  const counts = {
    static: STATIC_PATHS.length,
    categories: categories.length,
    products: products.length,
    collections: collections.filter((collection) => collection.isActive).length,
  };
  const languageCounts = {
    en: counts.static + counts.categories + counts.products + counts.collections,
    ar: counts.static,
    zh: counts.static,
    tr: counts.static,
  };
  const total = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
  console.info("Sitemap URL counts by type", counts);
  console.info("Sitemap URL counts by language", { ...languageCounts, total });

  const entries: SitemapEntry[] = [
    ...STATIC_PATHS.map((path) => ({
      path,
      translatedLocales: routing.locales,
    })),
    ...categories
      .map((category) => ({
        path: `/catalog/${categorySlug(category.slug)}`,
        translatedLocales: ["en"] as const,
      }))
      .filter((entry) => Boolean(validPath(entry.path))),
    ...products
      .map((product) => ({
        path: `/product/${productSlug(product.slug)}`,
        lastModified: product.createdAt,
        translatedLocales: ["en"] as const,
      }))
      .filter((entry) => Boolean(validPath(entry.path))),
    ...collections
      .filter((collection) => collection.isActive)
      .map((collection) => ({
        path: `/signature-collections/${slugify(collection.slug)}`,
        translatedLocales: ["en"] as const,
      }))
      .filter((entry) => Boolean(validPath(entry.path))),
  ];

  const body = entries.map((entry) => renderUrl(entry)).join("");
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
    'xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    body +
    "</urlset>";

  return new Response(xml, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/xml; charset=utf-8",
      "X-Sitemap-Url-Count": String(entries.length),
      "X-Sitemap-Canonical-Host": SITE_URL,
    },
  });
}
