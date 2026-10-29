import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

// ---------------------------------------------------------------------------
// Site URL
// ---------------------------------------------------------------------------
// Every absolute URL the site emits (canonical, hreflang, sitemap, robots,
// Open Graph, JSON-LD) is built from this one value. SITE_URL is required so a
// preview deployment can never accidentally publish its *.vercel.app hostname
// as a canonical URL.
const configuredSiteUrl = process.env.SITE_URL?.trim();
if (!configuredSiteUrl) {
  throw new Error(
    "SITE_URL is required. Set it to the canonical storefront origin, without a trailing slash."
  );
}

let parsedSiteUrl: URL;
try {
  parsedSiteUrl = new URL(configuredSiteUrl);
} catch {
  throw new Error("SITE_URL must be a valid absolute URL, for example https://www.example.com.");
}

if (parsedSiteUrl.pathname !== "/" || parsedSiteUrl.search || parsedSiteUrl.hash) {
  throw new Error("SITE_URL must contain only the origin and must not include a path, query, or hash.");
}

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");

// Anything other than exactly "true" keeps the whole site out of the index
// (previews, staging, local dev).
export const IS_INDEXING_ALLOWED = process.env.ALLOW_INDEXING === "true";

export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined;

export const SITE_NAME = "KMR City Ventures";

// Generated 1200x630 social card in /public/images (the brand logo on the
// site's cream background, no invented claims).
export const DEFAULT_OG_IMAGE = {
  url: "/images/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "KMR City Ventures — tools, building materials and paint in Ghana",
};

const OG_LOCALES: Record<string, string> = {
  en: "en_GH",
  ar: "ar_SA",
  zh: "zh_CN",
  tr: "tr_TR",
};

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// With localePrefix "as-needed" the default locale has no URL segment and
// every other locale is prefixed, e.g. "/catalog" and "/ar/catalog".
export function localizedPath(locale: string, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return clean || "/";
  return `/${locale}${clean}`;
}

// hreflang map for one path. Only locales that really serve the page are
// listed, and x-default points at the unprefixed (English) version.
export function alternateLanguages(path = "/"): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(localizedPath(locale, path));
  }
  languages["x-default"] = languages[routing.defaultLocale];
  return languages;
}

export interface PageSeoInput {
  locale: string;
  /** Locale-independent path, e.g. "/catalog/tools". */
  path?: string;
  title: string;
  description: string;
  /** Use the title verbatim (skips the "%s | KMR City Ventures" template). */
  absoluteTitle?: boolean;
  /** Canonical target when it differs from `path` (filtered/sorted pages). */
  canonicalPath?: string;
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
}

// One helper so every page emits the same shape: title, description,
// canonical, hreflang, robots, Open Graph and Twitter card.
export function pageMetadata({
  locale,
  path = "/",
  title,
  description,
  absoluteTitle = false,
  canonicalPath,
  noindex = false,
  image,
  imageAlt,
  type = "website",
}: PageSeoInput): Metadata {
  const url = absoluteUrl(localizedPath(locale, canonicalPath ?? path));
  const ogImage = image
    ? { url: absoluteUrl(image), width: 1200, height: 630, alt: imageAlt ?? title }
    : { ...DEFAULT_OG_IMAGE, url: absoluteUrl(DEFAULT_OG_IMAGE.url) };

  const indexable = IS_INDEXING_ALLOWED && !noindex;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: alternateLanguages(path),
    },
    // meta robots, so the control works even for a page Google reached via a
    // link on another site. When ALLOW_INDEXING isn't "true" every page is
    // noindex.
    robots: {
      index: indexable,
      follow: true,
      googleBot: { index: indexable, follow: true },
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale] ?? OG_LOCALES.en,
      alternateLocale: routing.locales
        .filter((other) => other !== locale)
        .map((other) => OG_LOCALES[other] ?? other),
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

// Text for meta descriptions: strip the staff-authored rich text HTML down to
// readable prose and cap it at a search-snippet friendly length.
export function plainText(html: string | null | undefined, max = 155): string {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max).trimEnd()}…`;
}
