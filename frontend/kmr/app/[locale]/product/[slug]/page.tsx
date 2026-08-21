import Link from "next/link";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { getProductBySlug } from "@/lib/api/client";
import { AddToQuoteButton } from "@/components/add-to-quote-button";
import { ProductDescription } from "@/components/product-description";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { getValidImages } from "@/lib/image";
import { formatPrice } from "@/lib/price";
import { TextReveal } from "@/components/text-reveal";

// Product.description is written by staff through AdminJS's rich text
// editor (see backend admin-module.service.ts) and stored as raw HTML.
// It's still sanitized before rendering here, an allowlist limited to
// the formatting that editor actually produces, nothing that could
// execute script or load an external resource.
function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "a",
      "ul", "ol", "li", "blockquote", "h1", "h2", "h3", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
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
            youtubeUrls={product.youtubeUrls ?? []}
            alt={product.name}
        />

        <div className="flex flex-col gap-6">
          <TextReveal as="h1" className="font-display text-2xl font-normal text-ink md:text-3xl">
            {product.name}
          </TextReveal>
          {formatPrice(product.priceDescription) && (
            <p className="text-xl text-ink-muted">{formatPrice(product.priceDescription)}</p>
          )}
          <div className="pt-2">
            <AddToQuoteButton product={product} />
          </div>
          {product.description && (
            <ProductDescription html={sanitizeDescription(product.description)} />
          )}
        </div>
      </div>
    </div>
  );
}
