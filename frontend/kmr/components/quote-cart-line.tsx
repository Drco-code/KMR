"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useQuoteCart, type QuoteCartItem } from "@/lib/store/quote-cart";
import { isValidImageSrc } from "@/lib/image";
import { formatPrice } from "@/lib/price";

export function QuoteCartLine({ item }: { item: QuoteCartItem }) {
  const setQuantity = useQuoteCart((state) => state.setQuantity);
  const removeItem = useQuoteCart((state) => state.removeItem);

  // Clean base name if item.name still had legacy concatenated label
  const displayName = item.variantColorName && item.name.includes(" — ")
    ? item.name.split(" — ")[0]
    : item.name;

  return (
    <div className="flex items-center gap-4 border-b border-border py-6">
      <div className="relative size-20 shrink-0 overflow-hidden bg-secondary rounded-sm">
        {isValidImageSrc(item.coverImage) ? (
          <Image src={item.coverImage} alt={displayName} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link
          href={item.href ?? `/product/${item.slug}`}
          className="truncate font-display text-base md:text-lg text-ink hover:text-gold transition-colors"
        >
          {displayName}
        </Link>

        {(item.variantColorName || item.variantSize) && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {item.variantColorName && (
              <div className="flex items-center gap-1.5 bg-zinc-100/80 px-2 py-0.5 rounded text-ink">
                <span className="text-ink-muted">Color:</span>
                {item.variantColorCode && (
                  <span
                    className="size-3 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: item.variantColorCode }}
                    aria-hidden
                  />
                )}
                <span className="font-medium">{item.variantColorName}</span>
              </div>
            )}

            {item.variantSize && (
              <div className="flex items-center gap-1 bg-zinc-100/80 px-2 py-0.5 rounded text-ink">
                <span className="text-ink-muted">Size:</span>
                <span className="font-medium">{item.variantSize}</span>
              </div>
            )}
          </div>
        )}

        {formatPrice(item.priceDescription) && (
          <p className="text-sm text-ink-muted">{formatPrice(item.priceDescription)}</p>
        )}
      </div>

      <div className="flex items-center gap-3 border border-border px-2 py-1">
        <button
          type="button"
          onClick={() => setQuantity(item.itemKey, item.quantity - 1)}
          className="flex size-6 items-center justify-center text-ink hover:text-gold"
          aria-label="Decrease quantity"
        >
          <Minus className="size-3" />
        </button>
        <span className="w-4 text-center text-sm">{item.quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity(item.itemKey, item.quantity + 1)}
          className="flex size-6 items-center justify-center text-ink hover:text-gold"
          aria-label="Increase quantity"
        >
          <Plus className="size-3" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => removeItem(item.itemKey)}
        className="flex size-8 items-center justify-center text-ink-muted hover:text-destructive"
        aria-label="Remove item"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
