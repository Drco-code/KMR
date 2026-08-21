import { useTranslations } from "next-intl";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

// Floating WhatsApp bubble with a hover/focus label so visitors know what it
// is. Pure CSS (group-hover / group-focus-visible), no client JS needed.
export function WhatsAppFab() {
  const t = useTranslations("whatsapp");
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!phone) return null;

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(
    t("message")
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-6 bottom-6 md:right-8 md:bottom-8 z-40 flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-[#20ba59] hover:shadow-2xl"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-full mr-3 flex -translate-y-1/2 translate-x-1 items-center gap-2 rounded-sm bg-ink px-3 py-2 text-xs font-semibold tracking-[0.05em] text-white uppercase whitespace-nowrap opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        {t("tooltip")}
        <span className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-ink" />
      </span>
      <WhatsAppIcon className="size-8 fill-current" />
      <span className="sr-only">{t("srOnly")}</span>
    </a>
  );
}
