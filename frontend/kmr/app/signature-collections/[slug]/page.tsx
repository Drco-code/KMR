import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSignatureCollectionBySlug } from "@/lib/api/client";
import { SignatureCollectionDetail } from "@/components/signature-collection-detail";

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

  const heroImage = collection.heroImage || FALLBACK_BY_TYPE[collection.type];

  return (
    <div className="flex flex-col gap-4 px-6 py-16 md:px-20 md:py-24">
      <Link
        href="/"
        className="text-xs font-medium tracking-[0.15em] text-gold uppercase"
      >
        ← Signature Collections
      </Link>

      <div className="grid grid-cols-1 gap-12 pt-8 md:grid-cols-2">
        <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-secondary md:max-w-lg">
          <Image
            src={heroImage}
            alt={collection.name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>

        <SignatureCollectionDetail collection={collection} />
      </div>
    </div>
  );
}
