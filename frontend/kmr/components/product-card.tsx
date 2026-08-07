"use client";

import Link from "next/link";
import { useQuoteCart } from "@/lib/store/quote-cart";
import { getValidImages } from "@/lib/image";
import { formatPrice } from "@/lib/price";
import { RevealImage } from "@/components/reveal-image";
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
    <div className="group flex flex-col gap-4">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-secondary"
      >
        {coverImage ? (
          <RevealImage
            src={coverImage}
            width={640}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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
          <button
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
            className="text-xs font-semibold tracking-[0.08em] text-ink uppercase underline decoration-from-font underline-offset-2 hover:text-gold"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
