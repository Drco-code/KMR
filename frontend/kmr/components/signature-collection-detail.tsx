"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteCart } from "@/lib/store/quote-cart";
import type { SignatureCollection } from "@/lib/api/types";

interface SignatureCollectionDetailProps {
  collection: SignatureCollection;
}

export function SignatureCollectionDetail({ collection }: SignatureCollectionDetailProps) {
  const addItem = useQuoteCart((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const [colorSearch, setColorSearch] = useState("");

  const colors = useMemo(() => collection.colors || [], [collection.colors]);
  const sizes = useMemo(() => collection.sizes || [], [collection.sizes]);

  const [selectedColorCode, setSelectedColorCode] = useState(colors[0]?.code ?? "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");

  const filteredColors = useMemo(() => {
    if (!colorSearch.trim()) return colors;
    const q = colorSearch.toLowerCase().trim();
    return colors.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [colors, colorSearch]);

  const selectedColor = colors.find((c) => c.code === selectedColorCode) || colors[0];
  const canAdd = Boolean(selectedColor && selectedSize);

  function handleAddToCart() {
    if (!selectedColor || !selectedSize) return;
    const variantLabel = `${selectedColor.name} / ${selectedSize}`;
    addItem({
      itemKey: `${collection.id}:${selectedColor.code}:${selectedSize}`,
      productId: collection.id,
      name: `${collection.name} — ${variantLabel}`,
      slug: collection.slug,
      href: `/signature-collections/${collection.slug}`,
      priceDescription: null,
      coverImage: collection.images?.[0] || collection.heroImage,
      variantColorCode: selectedColor.code,
      variantColorName: selectedColor.name,
      variantSize: selectedSize,
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

      {/* Colors Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-[0.12em] text-ink uppercase">
              Select Color
            </h2>
            {colors.length > 0 && (
              <span className="text-xs text-ink-muted">
                ({colors.length} {colors.length === 1 ? "shade" : "shades"} available)
              </span>
            )}
          </div>

          {colors.length > 8 && (
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 size-3.5 text-ink-muted" />
              <input
                type="text"
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                placeholder="Search shades..."
                className="h-8 rounded-full border border-border bg-white pl-8 pr-3 text-xs text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
              />
            </div>
          )}
        </div>

        {selectedColor && (
          <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-zinc-50/80 px-4 py-2.5 text-sm">
            <span
              className="size-6 rounded-full border border-black/15 shadow-sm"
              style={{ backgroundColor: selectedColor.code }}
              aria-hidden
            />
            <span className="font-medium text-ink">Selected: {selectedColor.name}</span>
            <span className="font-mono text-xs text-ink-muted">{selectedColor.code}</span>
          </div>
        )}

        {filteredColors.length === 0 ? (
          <p className="py-2 text-sm text-ink-muted">No shades match &quot;{colorSearch}&quot;</p>
        ) : (
          <div className="flex max-h-56 flex-wrap gap-2.5 overflow-y-auto pr-1">
            {filteredColors.map((color) => {
              const selected = color.code === (selectedColor?.code ?? "");
              return (
                <button
                  key={`${color.code}-${color.name}`}
                  type="button"
                  onClick={() => {
                    setSelectedColorCode(color.code);
                    setAdded(false);
                  }}
                  className={`group flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${
                    selected
                      ? "border-ink bg-ink text-white shadow-sm ring-2 ring-gold/40"
                      : "border-border bg-white text-ink hover:border-ink/60 hover:bg-zinc-50"
                  }`}
                  aria-pressed={selected}
                  title={`${color.name} (${color.code})`}
                >
                  <span
                    className="size-4 rounded-full border border-black/15 flex-shrink-0"
                    style={{ backgroundColor: color.code }}
                    aria-hidden
                  />
                  <span className="truncate max-w-[140px]">{color.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sizes Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-[0.12em] text-ink uppercase">Select Size</h2>
          {sizes.length > 0 && (
            <span className="text-xs text-ink-muted">({sizes.length} sizes)</span>
          )}
        </div>

        {sizes.length === 0 ? (
          <p className="text-sm text-ink-muted">No specific container sizes listed.</p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const selected = size === selectedSize;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    setAdded(false);
                  }}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                    selected
                      ? "border-ink bg-ink text-white ring-2 ring-gold/40"
                      : "border-border bg-white text-ink hover:border-ink/60 hover:bg-zinc-50"
                  }`}
                  aria-pressed={selected}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {added ? (
        <div className="flex flex-wrap items-center gap-4 pt-2">
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
