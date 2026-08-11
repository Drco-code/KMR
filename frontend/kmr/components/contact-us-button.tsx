import Link from "next/link";
import { Phone } from "lucide-react";

// Header "Contact Us" pill, links to the full contact page (previously a
// direct WhatsApp link; WhatsApp now lives on the page itself and in the
// floating action button).
export function ContactUsButton() {
  return (
    <Link
      href="/contact"
      className="hidden items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold tracking-[0.05em] text-white uppercase transition-colors hover:bg-black/90 md:flex"
    >
      <Phone className="size-3.5" />
      Contact Us
    </Link>
  );
}
