import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";

// The quote cart and quote review pages are client components (they read
// Zustand state), so their metadata lives here. Both are per-visitor pages
// with nothing to rank: noindex, but still crawlable so the links to the
// catalog keep working.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return pageMetadata({
    locale,
    path: "/quote",
    title: t("quoteTitle"),
    description: t("quoteDescription"),
    noindex: true,
  });
}

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
