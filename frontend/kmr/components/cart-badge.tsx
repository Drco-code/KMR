"use client";

import { useQuoteCartTotalItems } from "@/lib/store/quote-cart";

export function CartBadge() {
  const totalItems = useQuoteCartTotalItems();

  if (totalItems === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white shadow-sm">
      {totalItems}
    </span>
  );
}
