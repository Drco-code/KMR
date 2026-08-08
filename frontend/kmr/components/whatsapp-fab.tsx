import { MessageCircle } from "lucide-react";

// Floating WhatsApp bubble with a hover/focus label so visitors know what it
// is. Pure CSS (group-hover / group-focus-visible) — no client JS needed.
export function WhatsAppFab() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!phone) return null;

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Hi KMR, I'd like to ask about your collection."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-8 bottom-8 z-40 flex size-14 items-center justify-center rounded-xl bg-[#25d366] shadow-lg transition-transform hover:scale-105"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-full mr-3 flex -translate-y-1/2 translate-x-1 items-center gap-2 rounded-sm bg-ink px-3 py-2 text-xs font-semibold tracking-[0.05em] text-white uppercase whitespace-nowrap opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        Chat with us on WhatsApp
        <span className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-ink" />
      </span>
      <MessageCircle className="size-7 text-white" fill="white" strokeWidth={0} />
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
