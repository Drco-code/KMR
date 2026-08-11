import Link from "next/link";

const SERVICES = [
  {
    title: "Color Matching",
    description:
      "Our experts use spectro-analysis to match any sample, from a scrap of silk to a sunset photograph. Bring us a swatch, a photo, or an idea, and we'll formulate the exact hue.",
    cta: "Start Matching",
  },
  {
    title: "Professional Application",
    description:
      "Access our network of KMR certified master painters for a flawless, architectural finish on any residential or commercial project.",
    cta: "Book Application",
  },
  {
    title: "Project Specification",
    description:
      "For architects and designers: full material specs, coverage calculations, and bulk wholesale rates for large-scale builds.",
    cta: "Request Specs",
  },
];

export default function ConsultancyPage() {
  return (
    <div className="flex flex-col gap-20 px-6 py-16 md:px-20 md:py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          KMR Studio
        </span>
        <h1 className="font-display text-4xl text-ink md:text-5xl">
          Consultancy Services
        </h1>
        <p className="max-w-xl text-lg text-ink-muted md:text-justify md:hyphens-auto">
          Beyond the collection, our in-house colorists and application
          specialists help you bring architectural-grade finishes to life.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {SERVICES.map((service, i) => (
          <div
            key={service.title}
            className={`flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-center md:gap-16 ${
              i % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="aspect-video flex-1 bg-secondary" />
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="font-display text-3xl text-ink">{service.title}</h2>
              <p className="text-ink-muted md:text-justify md:hyphens-auto">{service.description}</p>
              <Link
                href="/quote"
                className="text-sm font-semibold tracking-[0.05em] text-gold uppercase underline underline-offset-4"
              >
                {service.cta} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
