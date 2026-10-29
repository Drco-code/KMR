import type { MetadataRoute } from "next";
import { getCategories, getProducts, getSignatureCollections } from "@/lib/api/client";
import { routing } from "@/i18n/routing";
import { absoluteUrl, localizedPath } from "@/lib/seo";

// /sitemap.xml
//
// Built from the live catalog: every public page, every category (parent and
// child alike, since each is browsable at /catalog/<slug>), every active
// product and every signature collection — each in all four locales, with
// hreflang alternates so Google treats them as translations of one page
// rather than duplicates.
//
// Regenerated hourly. If the API is unreachable the static pages are still
// listed instead of failing the whole file.
export const revalidate = 3600;

const STATIC_PATHS = ["/", "/catalog", "/consultancy", "/contact"];

interface Entry {
  path: string;
  lastModified?: Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, collections] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
    getSignatureCollections().catch(() => []),
  ]);

  const entries: Entry[] = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...categories.map((category) => ({ path: `/catalog/${category.slug}` })),
    ...products.map((product) => ({ path: `/product/${product.slug}` })),
    ...collections.map((collection) => ({
      path: `/signature-collections/${collection.slug}`,
    })),
  ];

  return entries.flatMap((entry) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = absoluteUrl(localizedPath(locale, entry.path));
    }
    languages["x-default"] = languages[routing.defaultLocale];

    return routing.locales.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, entry.path)),
      ...(entry.lastModified && !Number.isNaN(entry.lastModified.getTime())
        ? { lastModified: entry.lastModified }
        : {}),
      alternates: { languages },
    }));
  });
}
