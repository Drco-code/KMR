import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getBrands } from "@/lib/api/client";
import { getSignatureCollections } from "@/lib/api/client";
import { BrandStrip } from "@/components/brand-strip";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HeroBackground } from "@/components/hero-background";
import type { SignatureCollectionType } from "@/lib/api/types";

const SIGNATURE_SLOTS: Array<{
  type: SignatureCollectionType;
  name: string;
  fallbackSlug: string;
  image: string;
}> = [
  {
    type: "EMULSION",
    name: "KMR Emulsion Paint",
    fallbackSlug: "kmr-emulsion-paint",
    image: "/images/optimized/signature-1.webp",
  },
  {
    type: "OIL",
    name: "KMR Oil Paint",
    fallbackSlug: "kmr-oil-paint",
    image: "/images/optimized/signature-2.webp",
  },
  {
    type: "POP",
    name: "KMR POP Paint",
    fallbackSlug: "kmr-pop-paint",
    image: "/images/optimized/signature-3.webp",
  },
  {
    type: "GRAFFIATE",
    name: "KMR Graffiate Paint",
    fallbackSlug: "kmr-graffiate-paint",
    image: "/images/optimized/signature-4.webp",
  },
];

export default async function Home() {
  const t = useTranslations("home");
  const tProduct = useTranslations("product");

  const [brands, signatureCollections] = await Promise.all([
    getBrands(),
    getSignatureCollections(),
  ]);

  const byType = new Map(signatureCollections.map((collection) => [collection.type, collection]));

  return (
    <div className="flex flex-col">
      {/* Image-only hero, copy and CTAs will be added back once the direction is confirmed */}
      <section className="relative min-h-[50vh] overflow-hidden bg-ink md:min-h-[calc(100vh-120px)]">
        <HeroBackground />
      </section>

      <section className="flex flex-col items-center gap-16 px-6 py-24 md:px-20 md:py-30">
        <ScrollReveal className="flex flex-col items-center gap-4 text-center">
          <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            {t("theCollection")}
          </span>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            {t("paintCollections")}
          </h2>
        </ScrollReveal>
        <ScrollReveal
          className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.08}
          y={16}
          duration={0.6}
        >
          {SIGNATURE_SLOTS.map((slot) => {
            const collection = byType.get(slot.type);
            const href = `/signature-collections/${collection?.slug ?? slot.fallbackSlug}`;
            const imageSrc = collection?.heroImage || slot.image;
            const label = collection?.name || slot.name;

            return (
            <Link
              key={slot.type}
              href={href}
              className="group flex w-full max-w-[300px] flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="300px"
                />
              </div>
              <div className="p-4 pt-3">
                <span className="text-[10px] font-medium tracking-[0.1em] text-gold uppercase">
                  {tProduct("kmrPaintCollection")}
                </span>
                <p className="mt-1 text-sm font-semibold tracking-[0.04em] text-ink uppercase">
                  {label}
                </p>
              </div>
            </Link>
            );
          })}
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
              {t("whoWeAre")}
            </span>
            <h2 className="font-display text-4xl text-white md:text-5xl">
              {t("tagline")}
            </h2>
            <p className="max-w-xl text-lg text-white/60 md:text-justify md:hyphens-auto">
              {t("about")}
            </p>
            <div className="flex w-full max-w-xl items-center gap-5 border-t border-white/15 pt-6">
              <span className="font-display text-5xl text-gold-light">20+</span>
              <div className="flex flex-col">
                <span className="text-xs font-medium tracking-[0.2em] text-white/70 uppercase">
                  {t("yearsOf")}
                </span>
                <span className="font-display text-2xl text-white">{t("experience")}</span>
              </div>
            </div>
            <Link
              href="/catalog"
              className="mt-2 rounded-sm bg-gold px-8 py-3 text-sm font-semibold tracking-[0.05em] text-white uppercase transition-all duration-300 hover:scale-105 hover:bg-gold/90 hover:shadow-lg"
            >
              {t("learnMore")}
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <BrandStrip brands={brands} />
    </div>
  );
}
