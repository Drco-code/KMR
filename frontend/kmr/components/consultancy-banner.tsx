import Link from "next/link";

export function ConsultancyBanner() {
  return (
    <div className="flex flex-col items-center gap-6 bg-secondary px-6 py-20 text-center md:px-20">
      <h2 className="font-display text-3xl text-ink md:text-4xl">
        Technical Consultancy Available
      </h2>
      <p className="max-w-lg text-ink-muted">
        For large scale architectural projects and specialized industrial
        finishes, speak with our master technicians for a bespoke integration
        plan.
      </p>
      <Link
        href="/consultancy"
        className="bg-black px-8 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase hover:bg-black/90"
      >
        Schedule Professional Consultation
      </Link>
    </div>
  );
}
