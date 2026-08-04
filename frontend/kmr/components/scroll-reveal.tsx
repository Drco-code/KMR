"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

// Fades + lifts content in as it scrolls into view. Pass `stagger` to
// animate each direct child in sequence instead of the wrapper as a whole
// (used for grids/lists). Respects prefers-reduced-motion — reduced-motion
// users get the final state immediately, no motion at all.
export function ScrollReveal({
  children,
  className,
  y = 28,
  duration = 0.9,
  delay = 0,
  stagger,
  start = "top 85%",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? Array.from(el.children) : el;
        gsap.fromTo(
          targets,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration,
            delay,
            stagger,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start,
              once: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
