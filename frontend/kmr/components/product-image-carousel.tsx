"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevealImage } from "@/components/reveal-image";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { gsap } from "@/lib/gsap";

const AUTOPLAY_DELAY_MS = 4000;
const SWIPE_THRESHOLD = 50;

export function ProductImageCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goTo = useCallback((next: number) => {
    setIndex((next + images.length) % images.length);
  }, [images.length]);

  // Auto-advances one slide at a time; pausing on hover/focus so a visitor
  // who's actually looking at the gallery isn't fighting the timer, and
  // restarting from the current slide (not always slide 0) on resume.
  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, AUTOPLAY_DELAY_MS);
    return () => clearInterval(id);
  }, [images.length, paused]);

  // Crossfades every slide's opacity toward the active index instead of
  // hard-swapping the mounted image — this is what makes slides "animate
  // through each other" rather than cut.
  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        opacity: i === index ? 1 : 0,
        duration: 0.9,
        ease: "power2.inOut",
      });
    });
  }, [index]);

  // Touch/swipe handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Don't track touch if starting on a button
    if ((e.target as HTMLElement).closest('button')) return;
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Don't process swipe if touch started on a button
    if ((e.target as HTMLElement).closest('button')) return;
    
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        // Swiped left - go to next
        goTo(index + 1);
      } else {
        // Swiped right - go to previous
        goTo(index - 1);
      }
    }
  }, [index, goTo]);

  if (images.length === 0) {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-secondary md:max-w-lg">
        <div className="size-full bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-secondary md:max-w-lg"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            <RevealImage
              src={src}
              width={800}
              alt={alt}
              fill
              className="object-contain"
              sizes="(min-width: 768px) 40vw, 90vw"
              priority={i === 0}
            />
          </div>
        ))}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute top-1/2 left-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute top-1/2 right-3 z-10 flex size-9 -translate-y-1/2 items-center justify-center bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute right-3 bottom-3 z-10 bg-black/70 px-2 py-1 text-xs text-white">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mx-auto flex max-w-md gap-2 md:max-w-lg">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden bg-secondary ring-1 ring-transparent",
                i === index && "ring-ink"
              )}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
            >
              <Image
                src={cloudinaryUrl(src, 150)}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
