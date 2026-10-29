const apiOrigin = process.env.KMR_API_URL?.trim().replace(/\/+$/, "");

if (!apiOrigin) {
  throw new Error(
    "KMR_API_URL is required for the production build. Set it to the server-side NestJS API origin."
  );
}

const endpoints = {
  categories: `${apiOrigin}/category-module`,
  products: `${apiOrigin}/product-module`,
  collections: `${apiOrigin}/signature-collection-module`,
};

async function fetchCollection(label, url) {
  let response;
  try {
    response = await fetch(url);
  } catch (error) {
      throw new Error(
      `Catalog validation failed: ${label} request to ${url} could not be completed. ${
        error instanceof Error ? error.message : String(error)
      }`,
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new Error(
      `Catalog validation failed: ${label} request to ${url} returned HTTP ${response.status}.`
    );
  }

  const value = await response.json();
  if (!Array.isArray(value)) {
    throw new Error(`Catalog validation failed: ${label} response from ${url} was not an array.`);
  }
  return value;
}

const [categories, products, collections] = await Promise.all(
  Object.entries(endpoints).map(([label, url]) => fetchCollection(label, url))
);

const counts = {
  static: 4,
  categories: categories.length,
  products: products.filter((product) => product.isActive !== false).length,
  collections: collections.filter((collection) => collection.isActive !== false).length,
};
const languageCounts = {
  en: counts.static + counts.categories + counts.products + counts.collections,
  ar: counts.static,
  zh: counts.static,
  tr: counts.static,
};
const total = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);

console.info("Catalog validation passed. Sitemap URL counts by type:", counts);
console.info("Catalog validation passed. Sitemap URL counts by language:", {
  ...languageCounts,
  total,
});

if (counts.categories === 0 || counts.products === 0) {
  throw new Error(
    `Catalog validation failed: sitemap would contain only static or incomplete catalog data. ` +
      `categories=${counts.categories}, products=${counts.products}.`
  );
}
