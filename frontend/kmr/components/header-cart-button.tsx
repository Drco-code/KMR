"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useQuoteCart, useQuoteCartTotalItems } from "@/lib/store/quote-cart";

export function HeaderCartButton() {
  const totalItems = useQuoteCartTotalItems();
  const lastAddedAt = useQuoteCart((state) => state.lastAddedAt);
  const lastAddedQuantity = useQuoteCart((state) => state.lastAddedQuantity);

  const [isAnimating, setIsAnimating] = useState(false);
  const [showFloatPlus, setShowFloatPlus] = useState(false);
  const [floatQty, setFloatQty] = useState(1);
  const prevItemsRef = useRef(totalItems);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevItemsRef.current = totalItems;
      return;
    }

    if (totalItems > prevItemsRef.current || (lastAddedAt && Date.now() - lastAddedAt < 1200)) {
      const addedCount = lastAddedQuantity > 0 ? lastAddedQuantity : Math.max(1, totalItems - prevItemsRef.current);
      setFloatQty(addedCount);
      setIsAnimating(true);
      setShowFloatPlus(true);

      const animTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 700);

      const floatTimer = setTimeout(() => {
        setShowFloatPlus(false);
      }, 950);

      prevItemsRef.current = totalItems;
      return () => {
        clearTimeout(animTimer);
        clearTimeout(floatTimer);
      };
    }

    prevItemsRef.current = totalItems;
  }, [totalItems, lastAddedAt, lastAddedQuantity]);

  return (
    <Link
      href="/quote"
      className="relative flex size-10 items-center justify-center text-ink transition-colors hover:text-gold group"
      aria-label={`View quote cart (${totalItems} items)`}
    >
      {/* Elastic bouncing cart icon */}
      <div className={`transition-transform origin-bottom ${isAnimating ? "animate-cart-wiggle text-gold" : ""}`}>
        <ShoppingCart className="size-5 transition-transform group-hover:scale-110" />
      </div>

      {/* Badge with golden pulse ring */}
      {totalItems > 0 && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center">
          {isAnimating && (
            <span
              className="absolute size-5 rounded-full bg-gold/50 animate-gold-pulse pointer-events-none"
              aria-hidden
            />
          )}
          <span
            className={`relative flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white shadow-md transition-all ${
              isAnimating ? "animate-badge-pop ring-2 ring-gold/40" : ""
            }`}
          >
            {totalItems}
          </span>
        </div>
      )}

      {/* Floating +1 / +qty indicator */}
      {showFloatPlus && (
        <span
          className="absolute -top-4 right-1 font-display font-bold text-xs text-gold pointer-events-none select-none animate-float-up"
          aria-hidden
        >
          +{floatQty}
        </span>
      )}

      <span className="sr-only">View quote cart ({totalItems} items)</span>
    </Link>
  );
}
