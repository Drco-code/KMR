import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import sanitizeHtml from "sanitize-html";
import { getProductBySlug, getProducts } from "@/lib/api/client";
import { AddToQuoteButton } from "@/components/add-to-quote-button";
import { ProductDescription } from "@/components/product-description";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { ProductCard } from "@/components/product-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { getValidImages } from "@/lib/image";
import { formatPrice } from "@/lib/price";
import { TextReveal } from "@/components/text-reveal";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import { pageMetadata, plainText } from "@/lib/seo";
import { categoryPath, productPath } from "@/lib/slug";

// Product.description is written by staff through AdminJS's rich text
// editor (see backend admin-module.service.ts) and stored as raw HTML.
// It's still sanitized before rendering here, an allowlist limited to
// the formatting that editor actually produces, nothing that could
// execute script or load an external resource.
function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s", "a",
      "ul", "ol", "li", "blockquote", "h2", "h3", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) {
    return { robots: { index: false, follow: true } };
  }

  const t = await getTranslations({ locale, namespace: "seo" });
  // Prefer the staff-written description; fall back to a factual template so
  // the snippet is never empty or duplicated across the catalog.
  const description =
    plainText(product.description, 155) || t("productDescription", { name: product.name });

  return pageMetadata({
    locale,
    path: productPath(product.slug),
    title: product.name,
    description,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (decodeURIComponent(slug) !== product.slug) {
    permanentRedirect(productPath(product.slug));
  }

  const primaryCategory = product.categories.find((c) => c.isPrimary);

  const [tNav, tSeo] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "seo" }),
  ]);

  // Same-category products give visitors (and crawlers) a path from one
  // product to the next instead of dead-ending here.
  const related = primaryCategory
    ? (await getProducts().catch(() => []))
        .filter(
          (other) =>
            other.id !== product.id &&
            other.categories.some((c) => c.id === primaryCategory.id)
        )
        .slice(0, 4)
    : [];

  const crumbs = [
    { name: tNav("home"), path: "/" },
    { name: tNav("allProducts"), path: "/catalog" },
    ...(primaryCategory
      ? [{ name: primaryCategory.name, path: categoryPath(primaryCategory.slug) }]
      : []),
    { name: product.name, path: productPath(product.slug) },
  ];

  return (
    <div className="flex flex-col gap-4 px-6 py-16 md:px-20 md:py-24">
      <JsonLd data={breadcrumbSchema(locale, crumbs)} />
      <JsonLd
        data={productSchema({
          locale,
          product,
          description: plainText(product.description, 500) || tSeo("productDescription", { name: product.name }),
        })}
      />
      <Breadcrumbs items={crumbs} />

      <div className="grid grid-cols-1 gap-12 pt-8 md:grid-cols-2">
          <ProductImageCarousel
            images={getValidImages(product.images)}
            youtubeUrls={product.youtubeUrls ?? []}
            alt={product.name}
        />

        <div className="flex flex-col gap-6">
          <TextReveal as="h1" className="text-2xl font-medium text-ink md:text-3xl">
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

      {related.length > 0 && primaryCategory && (
        <section className="mt-16 flex flex-col gap-6 border-t border-border pt-12">
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            More from{" "}
            <Link
              href={categoryPath(primaryCategory.slug)}
              className="transition-colors hover:text-gold"
            >
              {primaryCategory.name}
            </Link>
          </h2>
          <div className="grid grid-cols-2 justify-items-center gap-4 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
