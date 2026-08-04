"use client";

import { useQuoteCartTotalItems } from "@/lib/store/quote-cart";

export function CartBadge() {
  const totalItems = useQuoteCartTotalItems();

  if (totalItems === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-white">
      {totalItems}
    </span>
  );
}
