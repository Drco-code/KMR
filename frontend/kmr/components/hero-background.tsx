"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export function HeroBackground() {
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = imageRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Ken Burns effect: subtle zoom + slight pan over 25 seconds, repeating
      // Starting at 0.98 to show more of the image initially (less zoomed)
      gsap.fromTo(
        el,
        {
          scale: 0.98,
          x: 0,
          y: 0,
        },
        {
          scale: 1.08,
          x: -20,
          y: -15,
          duration: 25,
          ease: "none",
          repeat: -1,
          yoyo: true,
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={imageRef} className="absolute inset-0 will-change-transform">
      <Image
        src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80&fit=crop&auto=format"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    </div>
  );
}
