"use client";

import { useRef, type ElementType } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

// Word-by-word mask reveal for headline moments — each word rises up from
// behind a clipped edge rather than just fading in. Reserved for page-level
// headlines (hero, catalog/product titles), not every heading — section
// titles keep the plainer ScrollReveal fade so this stays a deliberate
// signature moment instead of blanket motion.
export function TextReveal({
  children,
  as: Tag = "span",
  className,
  delay = 0,
}: {
  children: string;
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = children.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el.querySelectorAll("[data-word-inner]"),
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.9,
            delay,
            ease: "power3.out",
            stagger: 0.045,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag className={className}>
      <span ref={ref}>
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.05em]">
            <span data-word-inner className="inline-block will-change-transform">
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
