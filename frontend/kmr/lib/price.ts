// priceDescription is free text staff type in (see schema comment on
// Product.priceDescription) — usually a plain number ("10.99") but
// sometimes a note like "Inquire for wholesale rate". Only format it as
// currency (GH₵, thousands separators, 2 decimals) when it actually looks
// like a plain number — free-text notes pass through untouched.
export function formatPrice(priceDescription: string | null | undefined): string | null {
  if (!priceDescription) return null;
  const trimmed = priceDescription.trim();
  if (!trimmed) return null;

  const withoutSign = trimmed.replace(/^(GH₵|₵)/, "").trim();
  if (!/^\d[\d,]*(\.\d+)?$/.test(withoutSign)) return trimmed;

  const amount = Number(withoutSign.replace(/,/g, ""));
  return `GH₵${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Numeric value for sorting by price. Free-text notes like "Inquire for
// wholesale rate" have no parseable number — callers should sink those to
// the end of the list regardless of sort direction, not treat them as ₵0.
export function parsePrice(priceDescription: string | null | undefined): number | null {
  if (!priceDescription) return null;
  const match = priceDescription.replace(/,/g, "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}
