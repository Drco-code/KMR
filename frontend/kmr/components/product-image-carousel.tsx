"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevealImage } from "@/components/reveal-image";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { gsap } from "@/lib/gsap";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

const AUTOPLAY_DELAY_MS = 4000;
const SWIPE_THRESHOLD = 50;

export function ProductImageCarousel({
  images,
  youtubeUrls,
  alt,
}: {
  images: string[];
  youtubeUrls: string[];
  alt: string;
}) {
  const slides = useMemo(
    () => [
      ...images.map((src) => ({ type: "image" as const, src })),
      ...youtubeUrls
        .map((url) => ({ type: "video" as const, src: getYouTubeEmbedUrl(url) }))
        .filter((slide): slide is { type: "video"; src: string } => slide.src !== null),
    ],
    [images, youtubeUrls]
  );
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goTo = useCallback((next: number) => {
    setIndex((next + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advances one slide at a time; pausing on hover/focus so a visitor
  // who's actually looking at the gallery isn't fighting the timer, and
  // restarting from the current slide (not always slide 0) on resume.
  useEffect(() => {
    if (slides.length <= 1 || paused || slides[index]?.type === "video") return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_DELAY_MS);
    return () => clearInterval(id);
  }, [index, paused, slides]);

  // Crossfades every slide's opacity toward the active index instead of
  // hard-swapping the mounted image, this is what makes slides "animate
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

  if (slides.length === 0) {
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
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            {slide.type === "image" ? (
              <RevealImage
                src={slide.src}
                width={800}
                alt={alt}
                fill
                className="object-contain"
                sizes="(min-width: 768px) 40vw, 90vw"
                priority={i === 0}
              />
            ) : (
              <iframe
                src={slide.src}
                title={`${alt} video ${i - images.length + 1}`}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        ))}

        {slides.length > 1 && (
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
              {index + 1} / {slides.length}
            </span>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mx-auto flex max-w-md gap-2 md:max-w-lg">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden bg-secondary ring-1 ring-transparent",
                i === index && "ring-ink"
              )}
              aria-label={slide.type === "image" ? `View image ${i + 1}` : `Play video ${i - images.length + 1}`}
              aria-current={i === index}
            >
              {slide.type === "image" ? (
                <Image
                  src={cloudinaryUrl(slide.src, 150)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="flex size-full items-center justify-center bg-ink text-white">
                  <Play className="size-5 fill-current" aria-hidden="true" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
