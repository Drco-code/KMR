"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { buildMegaMenuTree, findRootCategoryBySlug } from "@/lib/category-tree";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Category } from "@/lib/api/types";

// One top-level nav category, rendered as a floating card with an animated
// expand/collapse. Height/opacity animate via a CSS grid-rows trick (smooth
// and reduced-motion-friendly), while the child links stagger in with GSAP.
// Mirrors the site's editorial design: ink text, gold accents, uppercase
// labels.
function CategoryAccordion({
  label,
  slug,
  categories,
}: {
  label: string;
  slug: string;
  categories: Category[];
}) {
  const root = findRootCategoryBySlug(categories, slug);
  const columns = root ? buildMegaMenuTree(categories, root.id) : [];
  const [open, setOpen] = useState(false);
  const linkListRef = useRef<HTMLDivElement>(null);
  const contentId = useId();

  // Stagger the child links in when the card expands. Reduced-motion users
  // just see the links appear with the card, no movement.
  useGSAP(
    () => {
      const el = linkListRef.current;
      if (!el || !open) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el.querySelectorAll("a"),
          { opacity: 0, x: -8 },
          {
            opacity: 1,
            x: 0,
            duration: 0.35,
            stagger: 0.045,
            ease: "power2.out",
            delay: 0.1,
          }
        );
      });
      return () => mm.revert();
    },
    { dependencies: [open], scope: linkListRef }
  );

  // A nav item whose root has no children is just a plain catalog link,
  // rendered as a card row so it sits consistently with the accordions.
  if (!root || columns.length === 0) {
    return (
      <SheetClose
        render={
          <Link
            href="/catalog"
            className="rounded-sm border border-border bg-white px-4 py-3 text-sm font-semibold tracking-wide text-ink uppercase shadow-[0_8px_24px_-12px_rgba(26,28,28,0.25)] transition-colors hover:text-gold"
          />
        }
      >
        {label}
      </SheetClose>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-border bg-white shadow-[0_8px_24px_-12px_rgba(26,28,28,0.25)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold tracking-wide text-ink uppercase">
          {label}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-gold transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        id={contentId}
        // inert while collapsed so the clipped links leave the tab order and
        // accessibility tree (the native <details> this replaces hid them
        // too), without it, Tab can land on invisible links.
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            ref={linkListRef}
            className="flex flex-col gap-3 border-t border-border/70 bg-secondary/60 px-4 py-3"
          >
            {columns.map(({ category, items }) => (
              <div key={category.id} className="flex flex-col gap-0.5">
                <SheetClose
                  render={
                    <Link
                      href={`/catalog/${category.slug}`}
                      className="pt-1 text-xs font-semibold tracking-[0.15em] text-gold uppercase transition-colors hover:text-ink"
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
                        className="py-1.5 pl-2 text-sm text-ink-muted transition-colors hover:text-gold"
                      />
                    }
                  >
                    {child.name}
                  </SheetClose>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileNav({ categories }: { categories: Category[] }) {
  const t = useTranslations("nav");


  const MEGA_MENU_ITEMS = [
    { label: t("tools"), slug: "tools" },
    { label: t("outdoorEquipment"), slug: "outdoor-equipment" },
    { label: t("buildingMaterials"), slug: "building-materials" },
    { label: t("homeEssentials"), slug: "home-essentials" },
    { label: t("autoEssentials"), slug: "auto-essentials" },
  ];

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="2xl:hidden">
            <Menu />
            <span className="sr-only">{t("openMenu")}</span>
          </Button>
        }
      />
      {/* bg-secondary canvas makes the white floating category cards stand out. */}
      <SheetContent side="right" className="bg-secondary">
        <SheetHeader>
          <SheetTitle>
            <Image
              src="/images/logo.png"
              alt="KMR City Ventures"
              width={480}
              height={317}
              className="h-10 w-auto"
            />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-4">
          <SheetClose
            render={
              <Link
                href="/"
                className="py-3 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            {t("home")}
          </SheetClose>

          <SheetClose
            render={
              <Link
                href="/catalog"
                className="py-3 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            {t("allProducts")}
          </SheetClose>

          <div className="flex flex-col gap-2.5 border-y border-border py-4">
            <span className="px-1 text-xs font-semibold tracking-[0.15em] text-ink-muted uppercase">
              {t("browseByCategory")}
            </span>
            {MEGA_MENU_ITEMS.map((item) => (
              <CategoryAccordion
                key={item.slug}
                label={item.label}
                slug={item.slug}
                categories={categories}
              />
            ))}
          </div>

          <SheetClose
            render={
              <Link
                href="/consultancy"
                className="py-3 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            {t("b2bSolutions")}
          </SheetClose>

          <SheetClose
            render={
              <Link
                href="/catalog"
                className="py-3 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            {t("topSellers")}
          </SheetClose>

          <SheetClose
            render={
              <Link
                href="/consultancy"
                className="border-t border-border py-3 pt-4 text-sm font-semibold tracking-wide uppercase text-ink"
              />
            }
          >
            {t("consultancy")}
          </SheetClose>

          <SheetClose
            render={
              <Link
                href="/contact"
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-semibold tracking-wide text-white uppercase"
              />
            }
          >
            <Phone className="size-4" />
            {t("contactUs")}
          </SheetClose>

          {/* Language switcher in mobile nav */}
          <div className="mt-4 pt-4 border-t border-border flex justify-center">
            <LanguageSwitcher />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
