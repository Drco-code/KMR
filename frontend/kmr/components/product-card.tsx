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
    <div className="group flex w-full max-w-[320px] flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow duration-300 hover:shadow-lg">
      {/* Image Section - White background with padding */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square w-full bg-white p-6"
      >
        {coverImage ? (
          <RevealImage
            src={coverImage}
            width={640}
            alt={product.name}
            fill
            className="object-contain object-center transition-transform duration-300 group-hover:scale-105"
            sizes="320px"
          />
        ) : (
          <div className="size-full bg-muted" />
        )}
      </Link>

      {/* Content Section */}
      <div className="flex flex-col gap-3 p-4">
        {/* Category Badge */}
        {categoryName && (
          <span className="text-[10px] font-medium tracking-[0.1em] text-ink-muted uppercase">
            {categoryName}
          </span>
        )}

        {/* Product Name - Full, not truncated */}
        <h3 className="font-display text-base font-semibold leading-tight text-ink">
          <Link href={`/product/${product.slug}`} className="hover:text-gold transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        {formatPrice(product.priceDescription) && (
          <p className="text-sm font-semibold text-ink">
            {formatPrice(product.priceDescription)}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Add to Cart Button - Full width */}
        <Button
          variant="default"
          size="default"
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
          className="w-full rounded-md bg-ink py-5 text-sm font-semibold tracking-[0.05em] text-white uppercase transition-all duration-300 hover:bg-gold hover:shadow-md"
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
