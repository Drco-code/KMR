import Link from "next/link";
import "./globals.css";

// Global fallback for URLs that never reach the [locale] segment (for example
// a request for a file that doesn't exist, which the next-intl middleware
// skips). The root layout in app/layout.tsx deliberately renders no document
// shell, so this page supplies <html>/<body> itself.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-24 text-center text-foreground">
        <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          404
        </span>
        <h1 className="font-display text-4xl text-ink">Page not found</h1>
        <p className="max-w-md text-ink-muted">
          The page you were looking for doesn&apos;t exist or has moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/catalog"
            className="rounded-sm bg-black px-8 py-3 text-sm font-semibold tracking-[0.1em] text-white uppercase"
          >
            Browse the catalog
          </Link>
          <Link
            href="/"
            className="rounded-sm border border-border px-8 py-3 text-sm font-semibold tracking-[0.1em] text-ink uppercase"
          >
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
