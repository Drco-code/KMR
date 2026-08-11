"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Collapsed by default so a long staff-authored description can't push
// AddToQuoteButton down the page, it only grows when the shopper opts in.
export function ProductDescription({ html }: { html: string }) {
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Only show the "more below" fade when the description actually exceeds
  // the capped panel height, short descriptions render with no fade line.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [open, html]);

  return (
    <div className="border-t border-ink/10 pt-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold tracking-[0.1em] text-ink uppercase"
      >
        Product Details
        <ChevronDown
          className={`size-4 shrink-0 text-ink-muted transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          {/* Capped + independently scrollable so a long staff-authored
              description can't drag the whole page into a long scroll,
              only this panel scrolls, with a fade to hint there's more. */}
          <div className="relative mt-4">
            <div ref={scrollRef} className="max-h-80 overflow-y-auto pr-2">
              <div
                className="prose prose-sm max-w-md text-ink-muted prose-headings:text-ink prose-strong:text-ink md:text-justify md:hyphens-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
            {overflowing && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
