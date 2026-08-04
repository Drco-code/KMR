import { Phone } from "lucide-react";

export function ContactUsButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!phone) return null;

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Hi KMR, I'd like to get in touch."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold tracking-[0.05em] text-white uppercase hover:bg-black/90 md:flex"
    >
      <Phone className="size-3.5" />
      Contact Us
    </a>
  );
}
