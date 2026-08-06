"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Collapsed by default so a long staff-authored description can't push
// AddToQuoteButton down the page — it only grows when the shopper opts in.
export function ProductDescription({ html }: { html: string }) {
  const [open, setOpen] = useState(false);

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
          <div
            className="prose prose-sm max-w-md pt-4 text-ink-muted prose-headings:text-ink prose-strong:text-ink"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
