"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { routing } from "@/i18n/routing";

const LOCALE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  ar: "🇸🇦",
  zh: "🇨🇳",
  tr: "🇹🇷",
};

const LOCALE_NAMES: Record<string, string> = {
  en: "EN",
  ar: "AR",
  zh: "中文",
  tr: "TR",
};

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchLocale(next: string) {
    if (next === locale) return;
    startTransition(() => {
      // Strip existing locale prefix and navigate to the new one
      // e.g. /ar/catalog → /zh/catalog  or  /catalog → /ar/catalog
      const segments = pathname.split("/");
      const isLocaleSegment = routing.locales.includes(segments[1] as "en" | "ar" | "zh" | "tr");
      const pathWithoutLocale = isLocaleSegment ? "/" + segments.slice(2).join("/") : pathname;

      const newPath =
        next === routing.defaultLocale
          ? pathWithoutLocale || "/"
          : `/${next}${pathWithoutLocale}`;

      router.push(newPath);
    });
  }

  return (
    <div className="relative group">
      <button
        type="button"
        aria-label={t("selectLanguage")}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium tracking-wide text-ink transition-all duration-200 hover:text-gold hover:bg-secondary ${isPending ? "opacity-60" : ""}`}
      >
        <Globe className="size-4 shrink-0" />
        <span className="text-xs font-semibold">{LOCALE_NAMES[locale]}</span>
      </button>

      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-1.5 w-40 origin-top-right scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 rounded-lg border border-border bg-white shadow-xl z-50 overflow-hidden">
        {routing.locales.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-secondary ${
              loc === locale ? "text-gold font-semibold bg-secondary/60" : "text-ink"
            }`}
          >
            <span className="text-base leading-none">{LOCALE_FLAGS[loc]}</span>
            <span>{t(loc as "en" | "ar" | "zh" | "tr")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
