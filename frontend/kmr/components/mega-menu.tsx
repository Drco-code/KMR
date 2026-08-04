"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { buildMegaMenuTree, findRootCategoryBySlug } from "@/lib/category-tree";
import type { Category } from "@/lib/api/types";

export function MegaMenu({
  label,
  slug,
  categories,
}: {
  label: string;
  slug: string;
  categories: Category[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  function handleMouseEnter() {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  }

  function handleMouseLeave() {
    closeTimeout.current = setTimeout(() => setOpen(false), 200);
  }

  const root = findRootCategoryBySlug(categories, slug);
  const isActive = root ? pathname.startsWith(`/catalog/${root.slug}`) : false;
  const columns = root ? buildMegaMenuTree(categories, root.id) : [];

  // Skip the animation on the very first mount (panel starts hidden via
  // the base classes below) — only animate on actual open/close toggles.
  const mounted = useRef(false);
  useGSAP(
    () => {
      if (!panelRef.current) return;
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (open) {
        gsap.to(panelRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.25,
          ease: "power2.out",
          pointerEvents: "auto",
        });
      } else {
        gsap.to(panelRef.current, {
          opacity: 0,
          y: -8,
          duration: 0.18,
          ease: "power2.in",
          pointerEvents: "none",
        });
      }
    },
    { dependencies: [open], scope: panelRef }
  );

  if (!root) {
    return (
      <Link
        href="/catalog"
        className={cn(
          "border-b-2 pb-1 text-sm font-semibold tracking-[0.02em] uppercase transition-colors",
          isActive ? "border-gold text-gold" : "border-transparent text-ink hover:text-gold"
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 border-b-2 pb-1 text-sm font-semibold tracking-[0.02em] uppercase outline-none transition-colors",
          isActive || open ? "border-gold text-gold" : "border-transparent text-ink hover:text-gold"
        )}
      >
        {label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {columns.length > 0 && (
        <div
          ref={panelRef}
          className="pointer-events-none fixed inset-x-0 top-[120px] z-40 -translate-y-2 border-b border-border bg-background opacity-0 shadow-lg"
        >
          <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-20">
            <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {columns.map(({ category, items }) => (
                <div key={category.id} className="flex flex-col gap-3">
                  <Link
                    href={`/catalog/${category.slug}`}
                    onClick={() => setOpen(false)}
                    className="border-b border-border pb-2 text-sm font-semibold tracking-[0.05em] text-ink uppercase hover:text-gold"
                  >
                    {category.name}
                  </Link>
                  <div className="flex flex-col gap-2">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/catalog/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="text-sm text-ink hover:text-gold"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
