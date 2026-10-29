"use client";

import Link from "next/link";
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

// Each page control is a real anchor pointing at the server-rendered page 2, 3,
// … (the catalog page reads ?page= and renders that page's products). Clicking
// it stays instant by preventing the default navigation for ordinary clicks,
// while crawlers still see a plain href.
export function PaginationNav({
  currentPage,
  totalPages,
  onPageChange,
  hrefForPage,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, page: number) {
    // Let modified clicks (new tab, middle click, etc.) behave like links.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    onPageChange(page);
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={hrefForPage(Math.max(1, currentPage - 1))}
        onClick={(event) => handleClick(event, Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={cn(
          "flex size-9 items-center justify-center border border-border text-ink",
          currentPage === 1 && "pointer-events-none opacity-30"
        )}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((page, i) =>
        page === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-ink-muted">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={hrefForPage(page)}
            onClick={(event) => handleClick(event, page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "flex size-9 items-center justify-center text-sm",
              page === currentPage
                ? "bg-black text-white"
                : "text-ink hover:bg-secondary"
            )}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={hrefForPage(Math.min(totalPages, currentPage + 1))}
        onClick={(event) => handleClick(event, Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={cn(
          "flex size-9 items-center justify-center border border-border text-ink",
          currentPage === totalPages && "pointer-events-none opacity-30"
        )}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
