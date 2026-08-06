import Image from "next/image";
import Link from "next/link";
import { getBrands, getProducts } from "@/lib/api/client";
import { ProductGrid } from "@/components/product-grid";
import { BrandStrip } from "@/components/brand-strip";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TextReveal } from "@/components/text-reveal";

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
      <section className="relative flex h-[560px] items-center justify-center overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80&fit=crop&auto=format"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/90 to-black" />
        <div className="absolute inset-0 bg-black/30" />
        <ScrollReveal
          className="relative flex max-w-3xl flex-col items-center gap-8 px-6 text-center"
          stagger={0.15}
          y={20}
          duration={0.8}
        >
          <TextReveal
            as="h1"
            className="font-display text-5xl leading-tight font-bold text-white md:text-6xl"
          >
            Everything for the Build, Beautifully Made
          </TextReveal>
          <p className="max-w-xl text-lg text-white/90">
            Premium paints, tools, and hardware for those who care how
            it&apos;s built — and how it looks when it&apos;s done.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/catalog"
              className="rounded-sm bg-black px-10 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase shadow-lg transition-opacity hover:opacity-90"
            >
              Explore Catalog
            </Link>
            <Link
              href="/quote"
              className="rounded-sm border border-white px-10 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:bg-white hover:text-ink"
            >
              Get a Quote
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <section className="flex flex-col gap-16 px-6 py-24 md:px-20 md:py-30">
        <ScrollReveal className="flex flex-col items-start gap-4">
          <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            The Collection
          </span>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            Signature Collections
          </h2>
        </ScrollReveal>
        <ProductGrid products={featured} />
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
              Craftsmanship &amp; Performance
            </span>
            <h2 className="font-display text-4xl text-white md:text-5xl">
              Built for the Job, Made to Last.
            </h2>
            <p className="max-w-xl text-lg text-white/60">
              From premium coatings to professional-grade tools, every
              product is chosen for durability and performance — vetted by
              people who use this stuff, not just sell it.
            </p>
            <Link
              href="/catalog"
              className="mt-2 rounded-sm bg-gold px-8 py-3 text-sm font-semibold tracking-[0.05em] text-white uppercase hover:opacity-90"
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
        className="relative text-sm font-semibold tracking-[0.05em] text-gold-light uppercase"
      >
        {cta} →
      </Link>
    </div>
  );
}
