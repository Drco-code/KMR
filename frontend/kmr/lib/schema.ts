import type { Product } from "@/lib/api/types";
import {
  BUSINESS_LEGAL_NAME,
  BUSINESS_NAME,
  EMAIL,
  HEADQUARTERS,
  OPENING_HOURS_SCHEMA,
  PHONE_E164,
  SERVICE_AREA,
  SOCIAL_LINKS,
} from "@/lib/business";
import { absoluteUrl, localizedPath, SITE_NAME, SITE_URL } from "@/lib/seo";
import { parsePrice } from "@/lib/price";
import { getValidImages } from "@/lib/image";

// ---------------------------------------------------------------------------
// JSON-LD builders.
//
// Rule of thumb: only emit facts the site actually shows or that are set in
// the repo. Fields we don't have (geocoordinates, review counts, stock
// levels, SKUs, product brands) are deliberately omitted rather than guessed
// — see the TODO list in SETUP.md.
// ---------------------------------------------------------------------------

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const STORE_ID = `${SITE_URL}/#store`;

function toImageUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : absoluteUrl(url);
}

const LOGO = `${SITE_URL}/images/logo.png`;

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: BUSINESS_NAME,
    ...(BUSINESS_LEGAL_NAME ? { legalName: BUSINESS_LEGAL_NAME } : {}),
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO,
      width: 480,
      height: 317,
    },
    ...(PHONE_E164 ? { telephone: PHONE_E164 } : {}),
    email: EMAIL,
    sameAs: SOCIAL_LINKS.map((link) => link.href),
    address: {
      "@type": "PostalAddress",
      ...HEADQUARTERS,
    },
  };
}

// The site-wide WebSite entity, with the catalog search exposed as a sitelinks
// search box. Search lives at /catalog?q=… (see components/nav-search.tsx).
export function websiteSchema(locale: string) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: "KMR",
    url: absoluteUrl(localizedPath(locale, "/")),
    inLanguage: locale,
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(localizedPath(locale, "/catalog"))}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// One shop as a LocalBusiness. HardwareStore is the most specific schema.org
// type that fits tools, building materials and paint.
export function hardwareStoreSchema(locale: string) {
  return {
    "@type": "HardwareStore",
    "@id": STORE_ID,
    name: BUSINESS_NAME,
    url: absoluteUrl(localizedPath(locale, "/")),
    image: LOGO,
    logo: LOGO,
    ...(PHONE_E164 ? { telephone: PHONE_E164 } : {}),
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      ...HEADQUARTERS,
    },
    areaServed: SERVICE_AREA.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    openingHoursSpecification: OPENING_HOURS_SCHEMA,
    sameAs: SOCIAL_LINKS.map((link) => link.href),
    parentOrganization: { "@id": ORGANIZATION_ID },
    // TODO: add "geo" (latitude/longitude) and "priceRange" once you have
    // real values — both are optional and must not be guessed.
  };
}

export function homeSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema(locale), hardwareStoreSchema(locale)],
  };
}

export interface Crumb {
  name: string;
  /** Locale-independent path, e.g. "/catalog/tools". */
  path: string;
}

export function breadcrumbSchema(locale: string, crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(localizedPath(locale, crumb.path)),
    })),
  };
}

// CollectionPage + ItemList of the products actually rendered on the page
// (catalog page 1, or the category listing), passed in by the page itself so
// the markup can never claim items the visitor can't see.
export function collectionPageSchema({
  locale,
  path,
  name,
  description,
  products,
}: {
  locale: string;
  path: string;
  name: string;
  description: string;
  products: Product[];
}) {
  const url = absoluteUrl(localizedPath(locale, path));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name,
        description,
        inLanguage: locale,
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": `${url}#itemlist` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#itemlist`,
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.name,
          url: absoluteUrl(localizedPath(locale, `/product/${product.slug}`)),
        })),
      },
    ],
  };
}

export function productSchema({
  locale,
  product,
  description,
}: {
  locale: string;
  product: Product;
  description: string;
}) {
  const url = absoluteUrl(localizedPath(locale, `/product/${product.slug}`));
  const images = getValidImages(product.images).map(toImageUrl);
  const price = parsePrice(product.priceDescription);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    url,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    // TODO: Product has no brand or SKU column in the database, so neither is
    // emitted. Add both to the Prisma model and this object if you want the
    // full product rich result.
    // TODO: stock is internal-only, so no availability is claimed here. If you
    // want "InStock"/"OutOfStock" in the markup, expose a boolean from the
    // public product endpoint first.
    ...(price !== null
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: price.toFixed(2),
            priceCurrency: "GHS",
            seller: { "@id": ORGANIZATION_ID },
          },
        }
      : {}),
  };
}

// Paint collections (KMR Emulsion, Oil, POP, Graffiate) are quote-only, so
// this is a Product without an Offer rather than a fake price.
export function signatureCollectionSchema({
  locale,
  name,
  slug,
  description,
  images,
}: {
  locale: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
}) {
  const url = absoluteUrl(localizedPath(locale, `/signature-collections/${slug}`));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    url,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images.map(toImageUrl) } : {}),
    brand: { "@type": "Brand", name: "KMR" },
    manufacturer: { "@id": ORGANIZATION_ID },
  };
}
