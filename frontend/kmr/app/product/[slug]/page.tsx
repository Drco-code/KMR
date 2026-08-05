import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/api/client";
import { AddToQuoteButton } from "@/components/add-to-quote-button";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { getValidImages } from "@/lib/image";
import { formatPrice } from "@/lib/price";
import { TextReveal } from "@/components/text-reveal";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const primaryCategory = product.categories.find((c) => c.isPrimary);

  return (
    <div className="flex flex-col gap-4 px-6 py-16 md:px-20 md:py-24">
      {primaryCategory && (
        <Link
          href={`/catalog/${primaryCategory.slug}`}
          className="text-xs font-medium tracking-[0.15em] text-gold uppercase"
        >
          ← {primaryCategory.name}
        </Link>
      )}

      <div className="grid grid-cols-1 gap-12 pt-8 md:grid-cols-2">
        <ProductImageCarousel
          images={getValidImages(product.images)}
          alt={product.name}
        />

        <div className="flex flex-col gap-6">
          <TextReveal as="h1" className="font-display text-4xl text-ink md:text-5xl">
            {product.name}
          </TextReveal>
          {formatPrice(product.priceDescription) && (
            <p className="text-xl text-ink-muted">{formatPrice(product.priceDescription)}</p>
          )}
          {product.description && (
            <p className="max-w-md text-base leading-relaxed text-ink-muted">
              {product.description}
            </p>
          )}
          <div className="pt-4">
            <AddToQuoteButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
