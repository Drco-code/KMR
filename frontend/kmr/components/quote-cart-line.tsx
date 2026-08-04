"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useQuoteCart, type QuoteCartItem } from "@/lib/store/quote-cart";
import { isValidImageSrc } from "@/lib/image";

export function QuoteCartLine({ item }: { item: QuoteCartItem }) {
  const setQuantity = useQuoteCart((state) => state.setQuantity);
  const removeItem = useQuoteCart((state) => state.removeItem);

  return (
    <div className="flex items-center gap-4 border-b border-border py-6">
      <div className="relative size-20 shrink-0 overflow-hidden bg-secondary">
        {isValidImageSrc(item.coverImage) ? (
          <Image src={item.coverImage} alt={item.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/product/${item.slug}`}
          className="truncate font-display text-lg text-ink"
        >
          {item.name}
        </Link>
        {item.priceDescription && (
          <p className="text-sm text-ink-muted">{item.priceDescription}</p>
        )}
      </div>

      <div className="flex items-center gap-3 border border-border px-2 py-1">
        <button
          type="button"
          onClick={() => setQuantity(item.productId, item.quantity - 1)}
          className="flex size-6 items-center justify-center text-ink hover:text-gold"
          aria-label="Decrease quantity"
        >
          <Minus className="size-3" />
        </button>
        <span className="w-4 text-center text-sm">{item.quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity(item.productId, item.quantity + 1)}
          className="flex size-6 items-center justify-center text-ink hover:text-gold"
          aria-label="Increase quantity"
        >
          <Plus className="size-3" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => removeItem(item.productId)}
        className="flex size-8 items-center justify-center text-ink-muted hover:text-destructive"
        aria-label="Remove item"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
