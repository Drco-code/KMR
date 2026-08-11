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
        {/* Placeholder cards until the client confirms the direction for
            signature collections — real curated products get wired back
            in once the idea is set. */}
        <div className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex w-full max-w-[300px] flex-col overflow-hidden rounded-md border border-dashed border-ink/15 bg-white"
            >
              <div className="flex aspect-square w-full items-center justify-center bg-ink/[0.03]">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-ink/20"
                >
                  <path d="M22 5 L39 22 L22 39 L5 22 Z" />
                  <circle cx="22" cy="22" r="5.5" />
                </svg>
              </div>
              <div className="flex flex-col gap-2 p-4 pt-3">
                <span className="text-[10px] font-medium tracking-[0.1em] text-gold uppercase">
                  Signature Collection 0{n}
                </span>
                <h3 className="font-sans text-sm font-medium text-ink">
                  To be revealed
                </h3>
                <p className="text-xs text-ink-muted">
                  Curated with our team, details coming soon.
                </p>
              </div>
            </div>
          ))}
        </div>
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
