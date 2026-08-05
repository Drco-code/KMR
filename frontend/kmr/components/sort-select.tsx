"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CatalogSort } from "@/lib/catalog";

const SORT_LABELS: Record<CatalogSort, string> = {
  featured: "Featured",
  "best-selling": "Best Selling",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  newest: "Newest",
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
};

export function SortSelect({
  sort,
  onChange,
}: {
  sort: CatalogSort;
  onChange: (sort: CatalogSort) => void;
}) {
  function handleChange(value: string | null) {
    if (value !== null && value in SORT_LABELS) {
      onChange(value as CatalogSort);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold tracking-[0.15em] text-ink-muted uppercase">
        Sort by
      </span>
      <Select value={sort} onValueChange={handleChange}>
        <SelectTrigger className="h-9 rounded-none border-0 border-b border-ink bg-transparent px-0 text-sm font-semibold tracking-[0.05em] text-ink uppercase">
          <SelectValue>{SORT_LABELS[sort]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(SORT_LABELS) as CatalogSort[]).map((key) => (
            <SelectItem key={key} value={key}>
              {SORT_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
