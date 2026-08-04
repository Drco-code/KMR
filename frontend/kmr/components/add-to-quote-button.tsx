"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteCart } from "@/lib/store/quote-cart";
import { getValidImages } from "@/lib/image";
import type { Product } from "@/lib/api/types";

export function AddToQuoteButton({ product }: { product: Product }) {
  const addItem = useQuoteCart((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      priceDescription: product.priceDescription,
      coverImage: getValidImages(product.images)[0] ?? null,
    });
    setAdded(true);
  }

  if (added) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Check className="size-4 text-gold" /> Added to your quote
        </span>
        <Link
          href="/quote"
          className="text-sm font-semibold tracking-[0.05em] text-gold uppercase underline underline-offset-4"
        >
          View Quote →
        </Link>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAdd}
      className="rounded-sm bg-black px-10 py-6 text-sm font-semibold tracking-[0.1em] text-white uppercase hover:bg-black/90"
    >
      Add to Inquiry
    </Button>
  );
}
