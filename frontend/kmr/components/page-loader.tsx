// Fallback for routes without a bespoke skeleton (see app/loading.tsx).
// Routes with real layout to preview (catalog, product) get their own
// skeleton instead, this one is intentionally minimal.
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-6 py-24">
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-gold" />
      </div>
      <span className="text-xs font-semibold tracking-[0.3em] text-ink-muted uppercase">
        Loading
      </span>
    </div>
  );
}
