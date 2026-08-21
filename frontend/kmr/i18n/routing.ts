import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // All supported locales
  locales: ["en", "ar", "zh", "tr"],
  // Default locale (no prefix in URL)
  defaultLocale: "en",
  // English has no URL prefix, e.g. "/" not "/en/"
  localePrefix: "as-needed",
});
