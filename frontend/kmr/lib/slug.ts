/**
 * Converts names and legacy database slugs into safe, stable URL slugs.
 *
 * This intentionally keeps only ASCII letters and numbers. It makes URLs
 * predictable across locales and prevents raw spaces, ampersands and markup
 * characters from reaching links, canonicals or XML.
 */
export function slugify(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function productSlug(slug: string | null | undefined): string {
  return slugify(slug);
}

export function categorySlug(slug: string | null | undefined): string {
  return slugify(slug);
}

export function productPath(slug: string | null | undefined): string {
  const normalized = productSlug(slug);
  return normalized ? `/product/${encodeURIComponent(normalized)}` : "/catalog";
}

export function categoryPath(slug: string | null | undefined): string {
  const normalized = categorySlug(slug);
  return normalized ? `/catalog/${encodeURIComponent(normalized)}` : "/catalog";
}

export function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment, index) => (index === 0 ? "" : encodeURIComponent(segment)))
    .join("/");
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
