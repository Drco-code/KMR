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

// Retries in lib/api/client.ts can use up to ~55s, so allow the route that much.
export const maxDuration = 60;

const STATIC_PATHS = ["/", "/catalog", "/consultancy", "/contact"];

interface SitemapEntry {
  path: string;
  lastModified?: string;
  translatedLocales: readonly string[];
}

function apiHost(): string {
  try {
    return new URL(API_URL as string).host;
  } catch {
    return "(KMR_API_URL is not a valid URL)";
  }
}

// Temporary diagnostics: shows which host was called, how long the request
// took and how many items came back, so an empty sitemap is never silent.
async function fetchCatalog<T>(
  label: string,
  endpoint: string,
  request: () => Promise<T[]>
): Promise<T[]> {
  const startedAt = Date.now();
  try {
    const value = await request();
    console.info(
      `[sitemap] ${label}: ${value.length} item(s) from ${apiHost()}${endpoint} in ${Date.now() - startedAt}ms`
    );
    return value;
  } catch (error) {
    console.error(
      `[sitemap] ${label}: request to ${apiHost()}${endpoint} failed after ${
        Date.now() - startedAt
      }ms. ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
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
  if (encoded === "/") return encoded;
  // Every catalog path starts with "/", so drop that leading empty segment
  // before checking the remaining ones.
  const segments = encoded.split("/").slice(1);
  return segments.length > 0 && segments.every((segment) => segment.length > 0) ? encoded : null;
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
      fetchCatalog("categories", "/category-module", getCategories),
      fetchCatalog("products", "/product-module", getProducts),
      fetchCatalog("collections", "/signature-collection-module", getSignatureCollections),
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
      // One hour of edge caching, then revalidate. No stale-while-revalidate so
      // a broken catalog surfaces within the hour instead of serving a stale
      // sitemap for a day.
      "Cache-Control": "public, s-maxage=3600, must-revalidate",
      "Content-Type": "application/xml; charset=utf-8",
      "X-Sitemap-Url-Count": String(entries.length),
      "X-Sitemap-Canonical-Host": SITE_URL,
    },
  });
}
