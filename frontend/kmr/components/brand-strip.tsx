import Image from "next/image";
import { getValidImages } from "@/lib/image";
import { ScrollReveal } from "@/components/scroll-reveal";
import { cloudinaryUrl } from "@/lib/cloudinary";
import type { Brand } from "@/lib/api/types";

export function BrandStrip({ brands }: { brands: Brand[] }) {
  const withLogos = brands.filter((brand) => getValidImages(brand.logo).length > 0);
  if (withLogos.length === 0) return null;

  return (
    <section className="flex flex-col items-center gap-12 border-t border-border bg-secondary px-6 py-24 text-center md:px-20 md:py-30">
      <div className="flex flex-col items-center gap-4">
        <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          Our Partners
        </span>
        <h2 className="font-display text-4xl text-ink md:text-5xl">
          Brands We Work With
        </h2>
      </div>
      <ScrollReveal
        className="flex flex-wrap items-center justify-center gap-x-20 gap-y-12"
        stagger={0.06}
        y={16}
        duration={0.6}
      >
        {withLogos.map((brand) => {
          const logo = getValidImages(brand.logo)[0];
          const image = (
            <Image
              src={cloudinaryUrl(logo, 400)}
              alt={brand.name}
              width={220}
              height={88}
              className="h-16 w-auto max-w-[180px] object-contain md:h-20"
            />
          );

          return brand.websiteUrl ? (
            <a
              key={brand.id}
              href={brand.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={brand.name}
            >
              {image}
            </a>
          ) : (
            <span key={brand.id} aria-label={brand.name}>
              {image}
            </span>
          );
        })}
      </ScrollReveal>
    </section>
  );
}
