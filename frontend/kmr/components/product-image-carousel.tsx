"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevealImage } from "@/components/reveal-image";
import { cloudinaryUrl } from "@/lib/cloudinary";

export function ProductImageCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        <div className="size-full bg-muted" />
      </div>
    );
  }

  function goTo(next: number) {
    setIndex((next + images.length) % images.length);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square w-full overflow-hidden bg-secondary">
        <RevealImage
          key={images[index]}
          src={images[index]}
          width={1000}
          alt={alt}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
          priority={index === 0}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute right-3 bottom-3 bg-black/70 px-2 py-1 text-xs text-white">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
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
