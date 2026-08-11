import Image from "next/image";
import Link from "next/link";
import { getBrands } from "@/lib/api/client";
import { BrandStrip } from "@/components/brand-strip";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HeroBackground } from "@/components/hero-background";

export default async function Home() {
  const brands = await getBrands();

  return (
    <div className="flex flex-col">
      {/* Image-only hero, copy and CTAs will be added back once the direction is confirmed */}
      <section className="relative min-h-[50vh] overflow-hidden bg-ink md:min-h-[calc(100vh-120px)]">
        <HeroBackground />
      </section>

      <section className="flex flex-col items-center gap-16 px-6 py-24 md:px-20 md:py-30">
        <ScrollReveal className="flex flex-col items-center gap-4 text-center">
          <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            The Collection
          </span>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            Signature Collections
          </h2>
        </ScrollReveal>
        {/* Signature collection teasers, placeholder images until the
            client confirms the direction for this section. */}
        <ScrollReveal
          className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.08}
          y={16}
          duration={0.6}
        >
          {[
            { src: "/images/optimized/signature-1.webp", n: 1 },
            { src: "/images/optimized/signature-2.webp", n: 2 },
            { src: "/images/optimized/signature-3.webp", n: 3 },
            { src: "/images/optimized/signature-4.webp", n: 4 },
          ].map((image) => (
            <div
              key={image.n}
              className="group flex w-full max-w-[300px] flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={image.src}
                  alt={`Signature Collection ${String(image.n).padStart(2, "0")}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="300px"
                />
              </div>
              <div className="p-4 pt-3">
                <span className="text-[10px] font-medium tracking-[0.1em] text-gold uppercase">
                  Signature Collection {String(image.n).padStart(2, "0")}
                </span>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </section>

      <section className="bg-black px-6 py-24 md:px-20 md:py-30">
        <ScrollReveal className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src="/images/who-we-are.png"
              alt="Child's hand covered in colourful finger paints"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
            />
          </div>
          <div className="flex flex-col items-start gap-6">
            <span className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">
              Who We Are
            </span>
            <h2 className="font-display text-4xl text-white md:text-5xl">
              Where Colour Meets Craft.
            </h2>
            <p className="max-w-xl text-lg text-white/60 md:text-justify md:hyphens-auto">
              KMR City Ventures is a Ghanaian building-materials house
              built on one belief. The right finish changes everything.
              From premium coatings and artisanal pigments to timber and
              professional-grade tools, we supply what architects,
              painters, and builders actually trust: products vetted by
              people who use them, backed by consultants who match,
              specify, and apply.
            </p>
            <div className="flex w-full max-w-xl items-center gap-5 border-t border-white/15 pt-6">
              <span className="font-display text-5xl text-gold-light">20+</span>
              <div className="flex flex-col">
                <span className="text-xs font-medium tracking-[0.2em] text-white/70 uppercase">
                  Years of
                </span>
                <span className="font-display text-2xl text-white">Experience</span>
              </div>
            </div>
            <Link
              href="/catalog"
              className="mt-2 rounded-sm bg-gold px-8 py-3 text-sm font-semibold tracking-[0.05em] text-white uppercase transition-all duration-300 hover:scale-105 hover:bg-gold/90 hover:shadow-lg"
            >
              Learn More
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <BrandStrip brands={brands} />
    </div>
  );
}
