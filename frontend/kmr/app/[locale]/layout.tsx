import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesk, Noto_Sans_Arabic, Noto_Sans_SC } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import {
  DEFAULT_OG_IMAGE,
  GOOGLE_SITE_VERIFICATION,
  IS_INDEXING_ALLOWED,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";

// display: "swap" keeps text visible while the webfont loads (no invisible
// text, no layout shift), which is what Core Web Vitals measures. The Arabic
// and Chinese faces are only downloaded when those glyphs are actually used,
// so they're not preloaded.
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-chinese",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

type Locale = "en" | "ar" | "zh" | "tr";

const RTL_LOCALES: Locale[] = ["ar"];

// Fallback for any page that doesn't define its own metadata. Individual
// pages override title/description/canonical — see lib/seo.ts.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("homeTitle"),
      template: `%s | ${SITE_NAME}`,
    },
    description: t("homeDescription"),
    applicationName: SITE_NAME,
    // Set GOOGLE_SITE_VERIFICATION in Vercel to render the Search Console
    // verification meta tag; nothing is rendered when it's empty.
    ...(GOOGLE_SITE_VERIFICATION
      ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
      : {}),
    // Belt and braces: every page also sets its own robots value through
    // lib/seo.ts. Anything but ALLOW_INDEXING="true" is noindex.
    robots: { index: IS_INDEXING_ALLOWED, follow: true },
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: t("homeTitle"),
      description: t("homeDescription"),
      images: [{ ...DEFAULT_OG_IMAGE, url: absoluteUrl(DEFAULT_OG_IMAGE.url) }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("homeTitle"),
      description: t("homeDescription"),
      images: [absoluteUrl(DEFAULT_OG_IMAGE.url)],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = RTL_LOCALES.includes(locale as Locale);

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className={`${hankenGrotesk.variable} ${playfairDisplay.variable} ${notoSansArabic.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <WhatsAppFab />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
