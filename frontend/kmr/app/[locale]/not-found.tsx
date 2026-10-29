import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getCategories } from "@/lib/api/client";
import { buildCategoryGroups } from "@/lib/category-tree";

// Rendered inside the locale layout (header, footer, fonts) for any 404 below
// the [locale] segment. Real links back into the catalog so a dead end still
// leads somewhere useful for visitors and crawlers.
export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tNav = await getTranslations("nav");

  const categories = await getCategories().catch(() => []);
  const groups = buildCategoryGroups(categories).slice(0, 8);

  return (
    <div className="flex flex-col items-center gap-10 px-6 py-24 text-center md:px-20 md:py-32">
      <div className="flex flex-col items-center gap-4">
        <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          404
        </span>
        <h1 className="font-display text-4xl text-ink md:text-5xl">{t("title")}</h1>
        <p className="max-w-xl text-lg text-ink-muted">{t("body")}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/catalog"
          className="rounded-sm bg-black px-8 py-3 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:bg-black/90"
        >
          {tNav("allProducts")}
        </Link>
        <Link
          href="/"
          className="rounded-sm border border-border px-8 py-3 text-sm font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
        >
          {t("backHome")}
        </Link>
        <Link
          href="/contact"
          className="rounded-sm border border-border px-8 py-3 text-sm font-semibold tracking-[0.1em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
        >
          {tNav("contactUs")}
        </Link>
      </div>

      {groups.length > 0 && (
        <div className="flex w-full max-w-3xl flex-col gap-4 border-t border-border pt-10">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-ink uppercase">
            {tNav("browseByCategory")}
          </h2>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {groups.map(({ category }) => (
              <li key={category.id}>
                <Link
                  href={`/catalog/${category.slug}`}
                  className="text-sm text-ink transition-colors hover:text-gold"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
