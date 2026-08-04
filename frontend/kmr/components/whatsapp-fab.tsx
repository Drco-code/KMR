import { MessageCircle } from "lucide-react";

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
      className="fixed right-8 bottom-8 z-40 flex size-14 items-center justify-center rounded-xl bg-[#25d366] shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-7 text-white" fill="white" strokeWidth={0} />
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
