import Link from "next/link";
import { useTranslations } from "next-intl";

export function ConsultancyBanner() {
  const t = useTranslations("consultancy");

  return (
    <div className="flex flex-col items-center gap-6 bg-secondary px-6 py-20 text-center md:px-20">
      <h2 className="font-display text-3xl text-ink md:text-4xl">
        {t("heading")}
      </h2>
      <p className="max-w-lg text-ink-muted">
        {t("body")}
      </p>
      <Link
        href="/consultancy"
        className="bg-black px-8 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase hover:bg-black/90"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
