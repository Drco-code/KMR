"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { getValidImages } from "@/lib/image";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { ScrollReveal } from "@/components/scroll-reveal";
import type { Brand } from "@/lib/api/types";

const PER_VIEW = 4;
const AUTO_ADVANCE_MS = 5000;
const DESKTOP_QUERY = "(min-width: 1024px)";

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Homepage "Our Brands" section, full uncropped logo, name and one-line
// tagline per brand, matching the client's reference layout. The 4-column
// desktop layout paginates through the catalog (auto-advancing, pausing on hover)
// once there are more than 4 brands; below lg and with 4 or fewer brands
// every brand is shown statically in a centered wrapped grid.
export function BrandStrip({ brands }: { brands: Brand[] }) {
  const withLogos = brands.filter((brand) => getValidImages(brand.logo).length > 0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [page, setPage] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pages = chunk(withLogos, PER_VIEW);
  const pageCount = pages.length;
  const shouldRotate = isDesktop && pageCount > 1;
  const currentPage = shouldRotate ? page % pageCount : 0;

  const stopAutoAdvance = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoAdvance = useCallback(() => {
    stopAutoAdvance();
    // No auto-rotation for reduced-motion users, manual arrows/dots still
    // work.
    if (!shouldRotate || prefersReducedMotion()) return;
    timerRef.current = window.setInterval(
      () => setPage((p) => (p + 1) % pageCount),
      AUTO_ADVANCE_MS
    );
  }, [shouldRotate, pageCount, stopAutoAdvance]);

  useEffect(() => {
    startAutoAdvance();
    return stopAutoAdvance;
  }, [startAutoAdvance, stopAutoAdvance]);

  // Fade + lift the active page's cards in on every page change (doubles as
  // the section's entrance animation). Reduced-motion users see the cards
  // without movement.
  useGSAP(
    () => {
      const el = pageRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el.children,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.out",
          }
        );
      });
      return () => mm.revert();
    },
    { dependencies: [currentPage], scope: pageRef }
  );

  if (withLogos.length === 0) return null;

  const goToPage = (next: number) => {
    stopAutoAdvance();
    setPage(((next % pageCount) + pageCount) % pageCount);
    startAutoAdvance();
  };

  const renderCard = (brand: Brand) => {
    const logo = getValidImages(brand.logo)[0];
    const image = (
      <Image
        src={cloudinaryUrl(logo, 512)}
        alt={`${brand.name} logo`}
        width={320}
        height={320}
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="w-20 h-20 object-contain md:w-40 md:h-40"
      />
    );

    return (
      <div
        key={brand.id}
        className="flex w-full max-w-[220px] sm:max-w-[300px] flex-1 flex-col items-center text-center"
      >
        {brand.websiteUrl ? (
          <a
            href={brand.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={brand.name}
            className="block transition-transform duration-300 hover:scale-105"
          >
            {image}
          </a>
        ) : (
          image
        )}
        <h3 className="mt-5 text-sm font-bold tracking-[0.18em] text-ink uppercase">
          {brand.name}
        </h3>
        {brand.description ? (
          <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-ink-muted hidden md:block">
            {brand.description}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <section className="border-t border-border bg-secondary px-6 py-24 md:px-20 md:py-30">
      <ScrollReveal className="flex flex-col items-center gap-5 text-center">
        <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          Our Partners
        </span>
        <h2 className="font-display text-4xl text-ink md:text-5xl">Our Brands</h2>
        <span aria-hidden className="h-0.5 w-14 bg-gold" />
      </ScrollReveal>

      {shouldRotate ? (
        <div
          className="mx-auto mt-16 w-full max-w-[1200px]"
          onMouseEnter={stopAutoAdvance}
          onMouseLeave={startAutoAdvance}
        >
          <div className="relative">
            <div
              ref={pageRef}
              className="grid grid-cols-2 md:grid-cols-4 items-start justify-items-center gap-6"
            >
              {pages[currentPage].map(renderCard)}
            </div>

            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Previous brands"
              className="absolute -left-5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white p-2.5 text-ink shadow-sm transition-all duration-200 hover:border-gold hover:text-gold"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Next brands"
              className="absolute -right-5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white p-2.5 text-ink shadow-sm transition-all duration-200 hover:border-gold hover:text-gold"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2.5">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToPage(index)}
                aria-label={`Go to brand page ${index + 1}`}
                aria-current={index === currentPage}
                className={
                  index === currentPage
                    ? "size-2 rounded-full bg-gold transition-colors duration-200"
                    : "size-2 rounded-full border border-ink/25 transition-colors duration-200 hover:border-gold"
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <ScrollReveal
          className="mx-auto mt-16 grid w-full max-w-[1200px] grid-cols-2 md:grid-cols-4 items-start justify-items-center gap-6"
          stagger={0.06}
          y={16}
          duration={0.6}
        >
          {withLogos.map(renderCard)}
        </ScrollReveal>
      )}
    </section>
  );
}
