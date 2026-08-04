"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export function PaginationNav({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-disabled={currentPage === 1}
        className={cn(
          "flex size-9 items-center justify-center border border-border text-ink",
          currentPage === 1 && "pointer-events-none opacity-30"
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((page, i) =>
        page === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-ink-muted">
            …
          </span>
        ) : (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "flex size-9 items-center justify-center text-sm",
              page === currentPage
                ? "bg-black text-white"
                : "text-ink hover:bg-secondary"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-disabled={currentPage === totalPages}
        className={cn(
          "flex size-9 items-center justify-center border border-border text-ink",
          currentPage === totalPages && "pointer-events-none opacity-30"
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
