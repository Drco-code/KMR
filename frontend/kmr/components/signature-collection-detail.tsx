"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteCart } from "@/lib/store/quote-cart";
import type { SignatureCollection } from "@/lib/api/types";

interface SignatureCollectionDetailProps {
  collection: SignatureCollection;
}

export function SignatureCollectionDetail({ collection }: SignatureCollectionDetailProps) {
  const addItem = useQuoteCart((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const colorOptions = useMemo(() => {
    const map = new Map<string, { colorCode: string; colorName: string }>();
    for (const variant of collection.variants) {
      if (!map.has(variant.colorCode)) {
        map.set(variant.colorCode, {
          colorCode: variant.colorCode,
          colorName: variant.colorName,
        });
      }
    }
    return Array.from(map.values());
  }, [collection.variants]);

  const [selectedColorCode, setSelectedColorCode] = useState(colorOptions[0]?.colorCode ?? "");
  const sizeOptions = useMemo(
    () =>
      collection.variants
        .filter((variant) => variant.colorCode === selectedColorCode)
        .map((variant) => variant.sizeLabel),
    [collection.variants, selectedColorCode]
  );
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] ?? "");
  const resolvedSelectedSize = sizeOptions.includes(selectedSize)
    ? selectedSize
    : (sizeOptions[0] ?? "");

  const selectedColor = colorOptions.find((color) => color.colorCode === selectedColorCode);
  const canAdd = Boolean(selectedColor && resolvedSelectedSize);

  function handleAddToCart() {
    if (!selectedColor || !resolvedSelectedSize) return;
    const variantLabel = `${selectedColor.colorName} / ${resolvedSelectedSize}`;
    addItem({
      itemKey: `${collection.id}:${selectedColor.colorCode}:${resolvedSelectedSize}`,
      productId: collection.id,
      name: `${collection.name} — ${variantLabel}`,
      slug: collection.slug,
      href: `/signature-collections/${collection.slug}`,
      priceDescription: null,
      coverImage: collection.heroImage,
      variantColorCode: selectedColor.colorCode,
      variantColorName: selectedColor.colorName,
      variantSize: resolvedSelectedSize,
    });
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          Signature Collection
        </span>
        <h1 className="font-display text-4xl text-ink md:text-5xl">{collection.name}</h1>
        {collection.description ? (
          <p className="max-w-2xl text-base leading-relaxed text-ink-muted">{collection.description}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold tracking-[0.12em] text-ink uppercase">Select Color</h2>
        <div className="flex flex-wrap gap-3">
          {colorOptions.map((color) => {
            const selected = color.colorCode === selectedColorCode;
            return (
              <button
                key={`${color.colorCode}-${color.colorName}`}
                type="button"
                onClick={() => {
                  setSelectedColorCode(color.colorCode);
                  const nextSizes = collection.variants
                    .filter((variant) => variant.colorCode === color.colorCode)
                    .map((variant) => variant.sizeLabel);
                  setSelectedSize(nextSizes[0] ?? "");
                }}
                className={`flex items-center gap-3 rounded-full border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-ink bg-ink text-white"
                    : "border-border bg-white text-ink hover:border-ink/60"
                }`}
                aria-pressed={selected}
              >
                <span
                  className="size-5 rounded-full border border-black/15"
                  style={{ backgroundColor: color.colorCode }}
                  aria-hidden
                />
                <span>{color.colorName}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold tracking-[0.12em] text-ink uppercase">Select Size</h2>
        <div className="flex flex-wrap gap-3">
          {sizeOptions.map((size) => {
            const selected = size === resolvedSelectedSize;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-ink bg-ink text-white"
                    : "border-border bg-white text-ink hover:border-ink/60"
                }`}
                aria-pressed={selected}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {added ? (
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Check className="size-4 text-gold" />
            Added to your quote
          </span>
          <Link
            href="/quote"
            className="text-sm font-semibold tracking-[0.05em] text-gold uppercase underline underline-offset-4"
          >
            View Quote →
          </Link>
        </div>
      ) : (
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          className="w-fit rounded-sm bg-black px-10 py-6 text-sm font-semibold tracking-[0.1em] text-white uppercase hover:bg-black/90"
        >
          Add to Cart
        </Button>
      )}
    </div>
  );
}
