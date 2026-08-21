// This root layout is intentionally minimal.
// The real layout (with <html>, <body>, fonts, providers) lives at
// app/[locale]/layout.tsx which next-intl's middleware routes all
// requests into via the [locale] segment.
//
// Next.js requires a root layout to exist; this one satisfies that
// requirement while delegating all real rendering to the locale layout.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
