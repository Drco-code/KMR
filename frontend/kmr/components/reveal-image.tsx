"use client";

import { useRef, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { cloudinaryUrl } from "@/lib/cloudinary";

// Wraps next/image (fill mode) with a Cloudinary size/format transform —
// the real fix for slow loads, since stored URLs are untransformed
// originals — plus a shimmer placeholder and a fade/scale reveal once the
// image actually decodes, instead of an abrupt pop-in.
export function RevealImage({
  src,
  width,
  className,
  ...props
}: Omit<ImageProps, "src" | "onLoad"> & { src: string; width: number }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      if (!loaded || !imgRef.current) return;
      gsap.fromTo(
        imgRef.current,
        { opacity: 0, scale: 1.06 },
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
    },
    { dependencies: [loaded], scope: imgRef }
  );

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
      <Image
        ref={imgRef}
        src={cloudinaryUrl(src, width)}
        onLoad={() => setLoaded(true)}
        className={cn(className, !loaded && "opacity-0")}
        {...props}
      />
    </>
  );
}
