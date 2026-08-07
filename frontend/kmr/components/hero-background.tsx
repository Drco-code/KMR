"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const SLIDES = [
  {
    desktop: "/images/optimized/hero-slide-1-desktop.webp",
    mobile: "/images/optimized/hero-slide-1-mobile.webp",
  },
  {
    desktop: "/images/optimized/hero-slide-2-desktop.webp",
    mobile: "/images/optimized/hero-slide-2-mobile.webp",
  },
];

const SLIDE_DURATION = 6; // seconds per slide
const TRANSITION_DURATION = 1.2; // crossfade duration

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    const slides = container.querySelectorAll<HTMLDivElement>("[data-slide]");
    if (slides.length < 2) return;

    // Set initial states
    gsap.set(slides[0], { opacity: 1 });
    gsap.set(slides[1], { opacity: 0 });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let currentIdx = 0;

      function nextSlide() {
        const nextIdx = (currentIdx + 1) % slides.length;
        const current = slides[currentIdx];
        const next = slides[nextIdx];

        // Crossfade with subtle Ken Burns on the incoming slide
        const tl = gsap.timeline({
          onComplete: () => {
            currentIdx = nextIdx;
            setCurrentIndex(nextIdx);
          },
        });

        // Ken Burns on outgoing (subtle zoom out)
        tl.to(current, {
          scale: 1.08,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
        }, 0);

        // Crossfade outgoing
        tl.to(current, {
          opacity: 0,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
        }, 0);

        // Ken Burns on incoming (start zoomed, animate to normal)
        gsap.set(next, { scale: 1.1 });
        tl.to(next, {
          scale: 1,
          duration: TRANSITION_DURATION + 0.5,
          ease: "power2.out",
        }, 0);

        // Crossfade incoming
        tl.to(next, {
          opacity: 1,
          duration: TRANSITION_DURATION,
          ease: "power2.inOut",
        }, 0);
      }

      // Auto-advance slides
      const interval = setInterval(nextSlide, SLIDE_DURATION * 1000);

      return () => clearInterval(interval);
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {SLIDES.map((slide, index) => (
        <div
          key={index}
          data-slide
          className="absolute inset-0 will-change-transform opacity-0"
        >
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={slide.mobile}
            />
            <source
              media="(min-width: 768px)"
              srcSet={slide.desktop}
            />
            <Image
              src={slide.desktop}
              alt="KMR Architectural Paint & Hardware"
              fill
              priority={index === 0}
              className="object-cover object-top"
              sizes="100vw"
            />
          </picture>
        </div>
      ))}
    </div>
  );
}
