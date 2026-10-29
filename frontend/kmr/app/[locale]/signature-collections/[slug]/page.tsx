import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSignatureCollectionBySlug } from "@/lib/api/client";
import { SignatureCollectionDetail } from "@/components/signature-collection-detail";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, signatureCollectionSchema } from "@/lib/schema";
import { pageMetadata, plainText } from "@/lib/seo";
import { getValidImages } from "@/lib/image";

const FALLBACK_BY_TYPE: Record<string, string> = {
  EMULSION: "/images/optimized/signature-1.webp",
  OIL: "/images/optimized/signature-2.webp",
  POP: "/images/optimized/signature-3.webp",
  GRAFFIATE: "/images/optimized/signature-4.webp",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = await getSignatureCollectionBySlug(slug).catch(() => null);
  if (!collection) return { robots: { index: false, follow: true } };

  const t = await getTranslations({ locale, namespace: "seo" });
  const description =
    plainText(collection.description, 155) ||
    t("collectionDescription", { name: collection.name });

  return pageMetadata({
    locale,
    path: `/signature-collections/${collection.slug}`,
    title: collection.name,
    description,
    image: collection.heroImage ?? FALLBACK_BY_TYPE[collection.type],
    imageAlt: collection.name,
  });
}

export default async function SignatureCollectionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const collection = await getSignatureCollectionBySlug(slug).catch(() => null);
  if (!collection) notFound();

  const fallbackImage =
    collection.heroImage ||
    FALLBACK_BY_TYPE[collection.type] ||
    "/images/optimized/signature-1.webp";
  const validUploadedImages = getValidImages(collection.images);
  const images =
    validUploadedImages.length > 0 ? validUploadedImages : [fallbackImage];

  const tNav = await getTranslations({ locale, namespace: "nav" });

  const crumbs = [
    { name: tNav("home"), path: "/" },
    { name: collection.name, path: `/signature-collections/${collection.slug}` },
  ];

  return (
    <div className="flex flex-col gap-4 px-6 py-16 md:px-20 md:py-24">
      <JsonLd data={breadcrumbSchema(locale, crumbs)} />
      <JsonLd
        data={signatureCollectionSchema({
          locale,
          name: collection.name,
          slug: collection.slug,
          description: plainText(collection.description, 500) || null,
          images,
        })}
      />
      <Breadcrumbs items={crumbs} />

      <SignatureCollectionDetail
        collection={collection}
        initialImages={images}
      />
    </div>
  );
}
