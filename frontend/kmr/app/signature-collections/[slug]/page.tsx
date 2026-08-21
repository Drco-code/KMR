import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignatureCollectionBySlug } from "@/lib/api/client";
import { SignatureCollectionDetail } from "@/components/signature-collection-detail";
import { ProductImageCarousel } from "@/components/product-image-carousel";
import { getValidImages } from "@/lib/image";

const FALLBACK_BY_TYPE: Record<string, string> = {
  EMULSION: "/images/optimized/signature-1.webp",
  OIL: "/images/optimized/signature-2.webp",
  POP: "/images/optimized/signature-3.webp",
  GRAFFIATE: "/images/optimized/signature-4.webp",
};

export default async function SignatureCollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getSignatureCollectionBySlug(slug);
  if (!collection) notFound();

  const fallbackImage = collection.heroImage || FALLBACK_BY_TYPE[collection.type] || "/images/optimized/signature-1.webp";
  const validUploadedImages = getValidImages(collection.images);
  const images = validUploadedImages.length > 0 ? validUploadedImages : [fallbackImage];

  return (
    <div className="flex flex-col gap-4 px-6 py-16 md:px-20 md:py-24">
      <Link
        href="/"
        className="text-xs font-medium tracking-[0.15em] text-gold uppercase"
      >
        ← Signature Collections
      </Link>

      <div className="grid grid-cols-1 gap-12 pt-8 md:grid-cols-2">
        <ProductImageCarousel
          images={images}
          youtubeUrls={[]}
          alt={collection.name}
        />

        <SignatureCollectionDetail collection={collection} />
      </div>
    </div>
  );
}
