"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Category } from "@/lib/api/types";

const VISIBLE_LIMIT = 5;

export function CategorySidebarFilter({
  categories,
  categoryCounts,
  selectedSlugs,
}: {
  categories: Category[];
  categoryCounts: Map<string, number>;
  selectedSlugs: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  function toggle(slug: string) {
    const next = selectedSlugs.includes(slug)
      ? selectedSlugs.filter((s) => s !== slug)
      : [...selectedSlugs, slug];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set("category", next.join(","));
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/catalog?${params.toString()}`);
  }

  const visibleCategories = showAll
    ? categories
    : categories.slice(0, VISIBLE_LIMIT);

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between text-xs font-semibold tracking-[0.15em] text-ink uppercase"
      >
        Category
        {expanded ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>

      {expanded && (
        <div className="flex flex-col gap-3">
          {visibleCategories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center justify-between gap-2 text-sm text-ink"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSlugs.includes(category.slug)}
                  onChange={() => toggle(category.slug)}
                  className="size-4 accent-ink"
                />
                {category.name}
              </span>
              <span className="text-ink-muted">
                ({categoryCounts.get(category.slug) ?? 0})
              </span>
            </label>
          ))}

          {categories.length > VISIBLE_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="self-start text-xs font-semibold tracking-[0.1em] text-gold uppercase"
            >
              {showAll ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
