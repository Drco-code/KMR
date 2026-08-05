// priceDescription is free text staff type in (see schema comment on
// Product.priceDescription) — usually a plain number ("10.99") but
// sometimes a note like "Inquire for wholesale rate". Only prefix the
// cedi sign when it actually looks like a price.
export function formatPrice(priceDescription: string | null | undefined): string | null {
  if (!priceDescription) return null;
  const trimmed = priceDescription.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("₵")) return trimmed;
  return /^\d/.test(trimmed) ? `₵${trimmed}` : trimmed;
}

// Numeric value for sorting by price. Free-text notes like "Inquire for
// wholesale rate" have no parseable number — callers should sink those to
// the end of the list regardless of sort direction, not treat them as ₵0.
export function parsePrice(priceDescription: string | null | undefined): number | null {
  if (!priceDescription) return null;
  const match = priceDescription.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}
