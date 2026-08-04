"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
};

export function SortSelect({ sort }: { sort: CatalogSort }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
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
