"use client";

import Link from "next/link";
import { ChevronDown, Menu, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { buildMegaMenuTree, findRootCategoryBySlug } from "@/lib/category-tree";
import type { Category } from "@/lib/api/types";

const MEGA_MENU_ITEMS = [
  { label: "Tools", slug: "tools" },
  { label: "Outdoor Equipment", slug: "outdoor-equipment" },
  { label: "Building Materials", slug: "building-materials" },
  { label: "Home Essentials", slug: "home-essentials" },
  { label: "Auto Essentials", slug: "auto-essentials" },
];

export function MobileNav({ categories }: { categories: Category[] }) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const contactHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent("Hi KMR, I'd like to get in touch.")}`
    : null;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="lg:hidden">
            <Menu />
            <span className="sr-only">Open menu</span>
          </Button>
        }
      />
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">KMR</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          <SheetClose
            render={
              <Link
                href="/"
                className="py-3 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            Home
          </SheetClose>

          <SheetClose
            render={
              <Link
                href="/catalog"
                className="py-3 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            All Products
          </SheetClose>

          <div className="flex flex-col border-t border-border pt-2">
            {MEGA_MENU_ITEMS.map((item) => {
              const root = findRootCategoryBySlug(categories, item.slug);
              const columns = root ? buildMegaMenuTree(categories, root.id) : [];

              if (!root || columns.length === 0) {
                return (
                  <SheetClose
                    key={item.slug}
                    render={
                      <Link
                        href="/catalog"
                        className="py-3 text-sm font-semibold tracking-wide uppercase text-ink"
                      />
                    }
                  >
                    {item.label}
                  </SheetClose>
                );
              }

              return (
                <details key={item.slug} className="group border-b border-border py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-sm font-semibold tracking-wide uppercase text-ink">
                    {item.label}
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="flex flex-col gap-3 py-2 pl-3">
                    {columns.map(({ category, items }) => (
                      <div key={category.id} className="flex flex-col gap-1">
                        <SheetClose
                          render={
                            <Link
                              href={`/catalog/${category.slug}`}
                              className="pt-2 text-xs font-semibold tracking-wide text-ink-muted uppercase"
                            />
                          }
                        >
                          {category.name}
                        </SheetClose>
                        {items.map((child) => (
                          <SheetClose
                            key={child.id}
                            render={
                              <Link
                                href={`/catalog/${child.slug}`}
                                className="py-1.5 pl-2 text-sm text-ink-muted"
                              />
                            }
                          >
                            {child.name}
                          </SheetClose>
                        ))}
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>

          <SheetClose
            render={
              <Link
                href="/consultancy"
                className="py-3 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            B2B Solutions
          </SheetClose>

          <SheetClose
            render={
              <Link
                href="/catalog"
                className="py-3 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            Top Sellers
          </SheetClose>

          <SheetClose
            render={
              <Link
                href="/consultancy"
                className="border-t border-border py-3 pt-4 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            Consultancy
          </SheetClose>

          {contactHref && (
            <SheetClose
              render={
                <a
                  href={contactHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-semibold tracking-wide text-white uppercase"
                />
              }
            >
              <Phone className="size-4" />
              Contact Us
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
