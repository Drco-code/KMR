"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Check, X, ArrowRight } from "lucide-react";
import { useQuoteCart, useQuoteCartTotalItems, type QuoteCartItem } from "@/lib/store/quote-cart";
import { isValidImageSrc } from "@/lib/image";
import { formatPrice } from "@/lib/price";

export function HeaderCartButton() {
  const pathname = usePathname();
  const totalItems = useQuoteCartTotalItems();
  const lastAddedAt = useQuoteCart((state) => state.lastAddedAt);
  const lastAddedQuantity = useQuoteCart((state) => state.lastAddedQuantity);
  const lastAddedItem = useQuoteCart((state) => state.lastAddedItem);

  const [isWiggling, setIsWiggling] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeItem, setActiveItem] = useState<QuoteCartItem | null>(null);

  const prevItemsRef = useRef(totalItems);
  const isFirstMount = useRef(true);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close toast when navigating
  useEffect(() => {
    setShowToast(false);
  }, [pathname]);

  // Click outside to dismiss
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowToast(false);
      }
    }
    if (showToast) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showToast]);

  // Trigger flyout toast and bounce on add to cart
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevItemsRef.current = totalItems;
      return;
    }

    if (totalItems > prevItemsRef.current || (lastAddedAt && Date.now() - lastAddedAt < 1200)) {
      setIsWiggling(true);
      if (lastAddedItem) {
        setActiveItem(lastAddedItem);
      }
      setShowToast(true);

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3500);

      const wiggleTimer = setTimeout(() => {
        setIsWiggling(false);
      }, 700);

      prevItemsRef.current = totalItems;
      return () => {
        clearTimeout(wiggleTimer);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      };
    }

    prevItemsRef.current = totalItems;
  }, [totalItems, lastAddedAt, lastAddedItem]);

  function handleMouseEnter() {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }

  function handleMouseLeave() {
    if (showToast) {
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  }

  const displayName = activeItem
    ? activeItem.variantColorName && activeItem.name.includes(" — ")
      ? activeItem.name.split(" — ")[0]
      : activeItem.name
    : "";

  return (
    <div ref={containerRef} className="relative">
      <Link
        href="/quote"
        className="relative flex size-10 items-center justify-center text-ink transition-colors hover:text-gold group"
        aria-label={`View quote cart (${totalItems} items)`}
      >
        {/* Cart Icon with Elastic Bounce */}
        <div className={`transition-transform origin-bottom ${isWiggling ? "animate-cart-wiggle text-gold" : ""}`}>
          <ShoppingCart className="size-5 transition-transform group-hover:scale-110" />
        </div>

        {/* Count Badge with Soft Breathing Glow / Blink when items are present */}
        {totalItems > 0 && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <span
              className={`relative flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white shadow-md transition-all ${
                isWiggling ? "animate-badge-pop ring-2 ring-gold/50" : "animate-cart-breathe"
              }`}
            >
              {totalItems}
            </span>
          </div>
        )}

        <span className="sr-only">View quote cart ({totalItems} items)</span>
      </Link>

      {/* Sleek Top-Right Glassmorphism Mini Cart Flyout Toast */}
      {showToast && activeItem && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full right-0 mt-3 w-84 md:w-96 rounded-xl border border-white/40 bg-white/95 backdrop-blur-xl shadow-2xl p-4 z-50 animate-cart-flyout overflow-hidden"
          style={{
            boxShadow: "0 20px 40px -15px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <Check className="size-3 stroke-[3]" />
              </span>
              <span className="text-xs font-semibold tracking-wider text-ink uppercase">
                Added to Quote Cart
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="text-ink-muted hover:text-ink transition-colors p-1 rounded-md"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Item Preview */}
          <div className="flex gap-3.5 py-3.5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 border border-border/60">
              {isValidImageSrc(activeItem.coverImage) ? (
                <Image
                  src={activeItem.coverImage}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="size-full bg-zinc-200" />
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1 justify-center gap-1">
              <p className="text-sm font-semibold text-ink line-clamp-1 truncate">
                {displayName}
              </p>

              {(activeItem.variantColorName || activeItem.variantSize) && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {activeItem.variantColorName && (
                    <span className="inline-flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded text-ink text-[11px]">
                      {activeItem.variantColorCode && (
                        <span
                          className="size-2.5 rounded-full border border-black/15 shrink-0"
                          style={{ backgroundColor: activeItem.variantColorCode }}
                        />
                      )}
                      <span className="truncate max-w-[100px]">{activeItem.variantColorName}</span>
                    </span>
                  )}
                  {activeItem.variantSize && (
                    <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-ink text-[11px]">
                      {activeItem.variantSize}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-ink-muted pt-0.5">
                <span>Qty: <strong className="text-ink">{activeItem.quantity}</strong></span>
                {formatPrice(activeItem.priceDescription) && (
                  <span className="font-medium text-ink">{formatPrice(activeItem.priceDescription)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              href="/quote"
              onClick={() => setShowToast(false)}
              className="flex items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-xs font-semibold tracking-wider text-ink uppercase hover:bg-zinc-50 transition-colors text-center"
            >
              View Cart ({totalItems})
            </Link>

            <Link
              href="/quote/review"
              onClick={() => setShowToast(false)}
              className="flex items-center justify-center gap-1 rounded-md bg-ink px-3 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-black/90 transition-colors text-center"
            >
              Checkout <ArrowRight className="size-3" />
            </Link>
          </div>

          {/* Auto-Dismiss Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-100 overflow-hidden">
            <div className="h-full bg-gold animate-toast-progress" />
          </div>
        </div>
      )}
    </div>
  );
}
