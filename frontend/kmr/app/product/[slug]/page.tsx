import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProductBySlug } from "@/lib/api/client";
import { AddToQuoteButton } from "@/components/add-to-quote-button";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { getValidImages } from "@/lib/image";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categories = await getCategories();
  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <div className="flex flex-col gap-4 px-6 py-16 md:px-20 md:py-24">
      {category && (
        <Link
          href={`/catalog/${category.slug}`}
          className="text-xs font-medium tracking-[0.15em] text-gold uppercase"
        >
          ← {category.name}
        </Link>
      )}

      <div className="grid grid-cols-1 gap-12 pt-8 md:grid-cols-2">
        <ProductImageCarousel
          images={getValidImages(product.images)}
          alt={product.name}
        />

        <div className="flex flex-col gap-6">
          <h1 className="font-display text-4xl text-ink md:text-5xl">
            {product.name}
          </h1>
          {product.priceDescription && (
            <p className="text-xl text-ink-muted">{product.priceDescription}</p>
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
