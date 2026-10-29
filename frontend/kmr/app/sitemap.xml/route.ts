import { getCategories, getProducts, getSignatureCollections } from "@/lib/api/client";
import { absoluteUrl, localizedPath, SITE_URL } from "@/lib/seo";
import { escapeXml, encodePath, categorySlug, productSlug, slugify } from "@/lib/slug";
import { routing } from "@/i18n/routing";

export const revalidate = 3600;

const STATIC_PATHS = ["/", "/catalog", "/consultancy", "/contact"];

interface SitemapEntry {
  path: string;
  lastModified?: string;
  translatedLocales: readonly string[];
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
  const [categories, products, collections] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
    getSignatureCollections().catch(() => []),
  ]);

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
