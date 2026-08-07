import Image from "next/image";
import Link from "next/link";
import { getBrands, getProducts } from "@/lib/api/client";
import { ProductGrid } from "@/components/product-grid";
import { BrandStrip } from "@/components/brand-strip";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HeroBackground } from "@/components/hero-background";

export default async function Home() {
  const [products, brands] = await Promise.all([
    getProducts(),
    getBrands(),
  ]);
  // "Signature Collections" is staff-curated via the isFeatured flag in
  // the admin panel. Falls back to the most recent products so the
  // section isn't empty before anything's been marked featured.
  const featuredProducts = products.filter((product) => product.isFeatured);
  const featured = (featuredProducts.length > 0 ? featuredProducts : products).slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Image-only hero — copy and CTAs will be added back once the direction is confirmed */}
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
        <div className="mx-auto w-full max-w-[1200px]">
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="bg-black px-6 py-24 md:px-20 md:py-30">
        <ScrollReveal className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80&fit=crop&auto=format"
              alt="Welder at work, sparks flying"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-col items-start gap-6">
            <span className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">
              Who We Are
            </span>
            <h2 className="font-display text-4xl text-white md:text-5xl">
              Where Colour Meets Craft.
            </h2>
            <p className="max-w-xl text-lg text-white/60">
              KMR City Ventures is a Ghanaian building-materials house
              built on one belief — the right finish changes everything.
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

      <section className="flex flex-col gap-16 px-6 py-24 md:px-20 md:py-30">
        <h2 className="text-center font-display text-4xl text-ink md:text-5xl">
          Consultancy Services
        </h2>
        <ScrollReveal className="flex flex-col gap-6 md:flex-row" stagger={0.15} y={24}>
          <ConsultancyTeaser
            title="Color Matching"
            description="Our experts use spectro-analysis to match any sample, from a scrap of silk to a sunset photograph."
            cta="Start Matching"
            image="https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80&fit=crop&auto=format"
          />
          <ConsultancyTeaser
            title="Professional Application"
            description="Access our network of KMR certified master painters for a flawless, architectural finish."
            cta="Book Application"
            image="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80&fit=crop&auto=format"
          />
        </ScrollReveal>
      </section>

      <BrandStrip brands={brands} />
    </div>
  );
}

function ConsultancyTeaser({
  title,
  description,
  cta,
  image,
}: {
  title: string;
  description: string;
  cta: string;
  image: string;
}) {
  return (
    <div className="relative flex flex-1 flex-col justify-end gap-4 overflow-hidden bg-ink p-10 min-h-[360px]">
      <Image
        src={image}
        alt=""
        fill
        className="object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
      <div className="absolute inset-0 bg-black/50" />
      <h3 className="relative font-display text-3xl text-white">{title}</h3>
      <p className="relative text-white/80">{description}</p>
      <Link
        href="/consultancy"
        className="relative text-sm font-semibold tracking-[0.05em] text-gold-light uppercase transition-all duration-300 hover:tracking-[0.1em] hover:text-gold"
      >
        {cta} →
      </Link>
    </div>
  );
}
