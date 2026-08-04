import Link from "next/link";
import { getBrands, getCategories, getProducts } from "@/lib/api/client";
import { ProductGrid } from "@/components/product-grid";
import { BrandStrip } from "@/components/brand-strip";

export default async function Home() {
  const [products, categories, brands] = await Promise.all([
    getProducts(),
    getCategories(),
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
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/90 to-black" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative flex max-w-3xl flex-col items-center gap-8 px-6 text-center">
          <h1 className="font-display text-5xl leading-tight font-bold text-white md:text-6xl">
            The Art of Living in Color
          </h1>
          <p className="max-w-xl text-lg text-white/90">
            Premium architectural coatings and artisanal pigments for the
            modern home. Discover a collection designed for those who value
            heritage and innovation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/catalog"
              className="rounded-sm bg-black px-10 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase shadow-lg transition-opacity hover:opacity-90"
            >
              Explore Palette
            </Link>
            <Link
              href="/quote"
              className="rounded-sm border border-white px-10 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:bg-white hover:text-ink"
            >
              Order Swatches
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-16 px-6 py-24 md:px-20 md:py-30">
        <div className="flex flex-col items-start gap-4">
          <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            The Collection
          </span>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            Signature Collections
          </h2>
        </div>
        <ProductGrid products={featured} categories={categories} />
      </section>

      <section className="bg-black px-6 py-24 md:px-20 md:py-30">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-6">
          <span className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">
            Pigment Science
          </span>
          <h2 className="font-display text-4xl text-white md:text-5xl">
            Architectural Grade Performance.
          </h2>
          <p className="max-w-xl text-lg text-white/60">
            We don&apos;t just sell paint; we engineer light. Our patented
            pigments offer unparalleled depth and color stability, ensuring
            your home remains vibrant for decades. Zero-VOC, eco-certified,
            and artist-curated.
          </p>
          <Link
            href="/catalog"
            className="mt-2 rounded-sm bg-gold px-8 py-3 text-sm font-semibold tracking-[0.05em] text-white uppercase hover:opacity-90"
          >
            Learn More
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-16 px-6 py-24 md:px-20 md:py-30">
        <h2 className="text-center font-display text-4xl text-ink md:text-5xl">
          Consultancy Services
        </h2>
        <div className="flex flex-col gap-6 md:flex-row">
          <ConsultancyTeaser
            title="Color Matching"
            description="Our experts use spectro-analysis to match any sample, from a scrap of silk to a sunset photograph."
            cta="Start Matching"
          />
          <ConsultancyTeaser
            title="Professional Application"
            description="Access our network of KMR certified master painters for a flawless, architectural finish."
            cta="Book Application"
          />
        </div>
      </section>

      <BrandStrip brands={brands} />
    </div>
  );
}

function ConsultancyTeaser({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-4 bg-ink p-10 min-h-[360px]">
      <h3 className="font-display text-3xl text-white">{title}</h3>
      <p className="text-white/80">{description}</p>
      <Link
        href="/consultancy"
        className="text-sm font-semibold tracking-[0.05em] text-gold-light uppercase"
      >
        {cta} →
      </Link>
    </div>
  );
}
