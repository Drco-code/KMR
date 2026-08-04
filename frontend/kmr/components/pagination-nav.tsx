import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function pageHref(searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

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
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: URLSearchParams;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={pageHref(searchParams, Math.max(1, currentPage - 1))}
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
            href={pageHref(searchParams, page)}
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
        href={pageHref(searchParams, Math.min(totalPages, currentPage + 1))}
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
