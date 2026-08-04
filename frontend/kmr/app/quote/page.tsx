"use client";

import Link from "next/link";
import { useQuoteCart } from "@/lib/store/quote-cart";
import { QuoteCartLine } from "@/components/quote-cart-line";
import { Button } from "@/components/ui/button";

export default function QuotePage() {
  const items = useQuoteCart((state) => state.items);

  return (
    <div className="flex flex-col gap-10 px-6 py-16 md:px-20 md:py-24">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          Order Inquiry
        </span>
        <h1 className="font-display text-4xl text-ink md:text-5xl">
          Your Quote Cart
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-6 py-16">
          <p className="text-ink-muted">
            You haven&apos;t added any items to your quote yet.
          </p>
          <Link
            href="/catalog"
            className="rounded-sm bg-black px-8 py-3 text-sm font-semibold tracking-[0.1em] text-white uppercase hover:bg-black/90"
          >
            Browse the Catalog
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8 md:max-w-2xl">
          <div className="flex flex-col">
            {items.map((item) => (
              <QuoteCartLine key={item.productId} item={item} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">
              {items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
            </span>
            <Link href="/quote/review">
              <Button className="rounded-sm bg-black px-10 py-6 text-sm font-semibold tracking-[0.1em] text-white uppercase hover:bg-black/90">
                Continue
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
