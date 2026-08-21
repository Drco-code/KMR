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
    <div className="group flex w-full max-w-[240px] sm:max-w-[300px] flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl">
      {/* Image Section - White background with padding */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square w-full bg-gray-50 p-6 sm:p-8"
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
      <div className="flex flex-col gap-2 p-4 pt-3">
        {/* Category Badge */}
        {categoryName && (
          <span className="text-[10px] font-medium tracking-[0.1em] text-ink-muted uppercase">
            {categoryName}
          </span>
        )}

        {/* Product Name - Full, not truncated */}
        <h3 className="font-sans text-sm font-medium leading-snug text-ink">
          <Link href={`/product/${product.slug}`} className="hover:text-gold transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        {formatPrice(product.priceDescription) && (
          <p className="text-sm font-semibold text-ink mt-1">
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
          className="w-full rounded-md bg-[#1a2744] py-3 sm:py-4 text-sm font-semibold tracking-[0.02em] text-white transition-all duration-300 hover:bg-[#1a2744]/90 hover:shadow-md"
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
