"use client";

import { useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { cloudinaryUrl } from "@/lib/cloudinary";

// Wraps next/image (fill mode) with a Cloudinary size/format transform —
// the real fix for slow loads, since stored URLs are untransformed
// originals — plus a shimmer placeholder and a fade/scale reveal once the
// image actually decodes, instead of an abrupt pop-in.
//
// The reveal is triggered imperatively (from the callback ref and from
// onLoad directly), not from a useEffect/useGSAP dependency array — a
// cached image can finish loading before a dependency-driven effect ever
// gets to run, and driving the animation off of a "loaded" state introduces
// a render-timing race. Triggering it directly from whichever fires first
// (already-complete on mount, or the load event) is race-proof.
export function RevealImage({
  src,
  width,
  className,
  ...props
}: Omit<ImageProps, "src" | "onLoad"> & { src: string; width: number }) {
  const [loaded, setLoaded] = useState(false);
  const revealed = useRef(false);

  function reveal(img: HTMLImageElement) {
    if (revealed.current) return;
    revealed.current = true;
    setLoaded(true);
    gsap.fromTo(
      img,
      { opacity: 0, scale: 1.02 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: "power2.out",
        // Clear the inline transform GSAP leaves behind so CSS-driven
        // hover effects (e.g. ProductCard's group-hover:scale-105) can
        // still take over afterward — inline styles otherwise win.
        clearProps: "transform",
      }
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
      <Image
        ref={(img) => {
          if (img?.complete) reveal(img);
        }}
        src={cloudinaryUrl(src, width)}
        onLoad={(event) => reveal(event.currentTarget)}
        className={cn(className, "opacity-0")}
        {...props}
      />
    </>
  );
}
