"use client";

import Link from "next/link";
import { useQuoteCart } from "@/lib/store/quote-cart";
import { getValidImages } from "@/lib/image";
import { formatPrice } from "@/lib/price";
import { RevealImage } from "@/components/reveal-image";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/api/types";

export function ProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const addItem = useQuoteCart((state) => state.addItem);
  const coverImage = getValidImages(product.images)[0] ?? null;

  return (
    <div className="group flex w-full max-w-[380px] flex-col gap-4">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-secondary rounded-sm"
      >
        {coverImage ? (
          <RevealImage
            src={coverImage}
            width={640}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            sizes="380px"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </Link>
      <div className="flex flex-col gap-1">
        <h3 className="truncate font-display text-lg text-ink">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        {categoryName && (
          <p className="text-xs tracking-[0.08em] text-ink-muted uppercase">
            {categoryName}
          </p>
        )}
        <div className="flex items-end justify-between pt-2">
          {formatPrice(product.priceDescription) ? (
            <span className="text-sm text-ink">{formatPrice(product.priceDescription)}</span>
          ) : (
            <span />
          )}
          <Button
            variant="outline"
            size="xs"
            type="button"
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                priceDescription: product.priceDescription,
                coverImage,
              })
            }
            className="tracking-[0.08em] uppercase"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
