// priceDescription is free text staff type in (see schema comment on
// Product.priceDescription), usually a plain number ("10.99") but
// sometimes a note like "Inquire for wholesale rate". Only format it as
// currency (GH₵, thousands separators, 2 decimals) when it actually looks
// like a plain number, free-text notes pass through untouched.
export function formatPrice(priceDescription: string | null | undefined): string | null {
  if (!priceDescription) return null;
  const trimmed = priceDescription.trim();
  if (!trimmed) return null;

  const withoutSign = trimmed.replace(/^(GH₵|₵)/, "").trim();
  if (!/^\d[\d,]*(\.\d+)?$/.test(withoutSign)) return trimmed;

  const amount = Number(withoutSign.replace(/,/g, ""));
  return formatAmount(amount);
}

export function formatAmount(amount: number): string {
  return `GH₵${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Numeric value for sorting or calculating totals.
export function parsePrice(priceDescription: string | null | undefined): number | null {
  if (!priceDescription) return null;
  const trimmed = priceDescription.trim();
  const withoutSign = trimmed.replace(/^(GH₵|₵)/, "").trim();
  if (!/^\d[\d,]*(\.\d+)?$/.test(withoutSign)) return null;
  const amount = Number(withoutSign.replace(/,/g, ""));
  return isNaN(amount) ? null : amount;
}

export function getItemSubtotal(
  priceDescription: string | null | undefined,
  quantity: number
): number | null {
  const unitPrice = parsePrice(priceDescription);
  if (unitPrice === null) return null;
  return unitPrice * quantity;
}

export function calculateCartEstimatedTotal(
  items: Array<{ priceDescription: string | null | undefined; quantity: number }>
): {
  total: number;
  hasPricedItems: boolean;
  unpricedCount: number;
  formattedTotal: string;
} {
  let total = 0;
  let pricedCount = 0;
  let unpricedCount = 0;

  for (const item of items) {
    const unitPrice = parsePrice(item.priceDescription);
    if (unitPrice !== null) {
      total += unitPrice * item.quantity;
      pricedCount += 1;
    } else {
      unpricedCount += 1;
    }
  }

  return {
    total,
    hasPricedItems: pricedCount > 0,
    unpricedCount,
    formattedTotal: formatAmount(total),
  };
}
