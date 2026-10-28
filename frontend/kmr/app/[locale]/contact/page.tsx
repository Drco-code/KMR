import type { Metadata } from "next";
import { headers } from "next/headers";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ContactForm } from "@/components/contact-form";
import { mapsUrl, SHOP_LOCATIONS } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Contact | KMR",
  description:
    "Get in touch with KMR City Ventures about products, projects, wholesale pricing, or consultancy.",
};

// Shop addresses live in lib/locations.ts (shared with the footer), so this
// list only holds the generic contact details.
const CONTACT_DETAILS = [
  {
    icon: Phone,
    title: "Phone",
    value: "+233 XX XXX XXXX",
    note: "Call or text, Mon – Sat",
  },
  {
    icon: Mail,
    title: "Email",
    value: "hello@kmr.com.gh",
    note: "We reply within 24 hours",
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Mon – Sat · 8:00am – 6:00pm",
    note: "Closed on Sundays & public holidays",
  },
];

export default async function ContactPage() {
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  // Picks Apple Maps on Apple devices, Google Maps everywhere else.
  const userAgent = (await headers()).get("user-agent");

  return (
    <div className="flex flex-col gap-16 px-6 py-16 md:px-20 md:py-24">
      <ScrollReveal className="flex flex-col items-center gap-4 text-center">
        <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
          Get In Touch
        </span>
        <h1 className="font-display text-4xl text-ink md:text-5xl">Contact Us</h1>
        <p className="max-w-xl text-lg text-ink-muted md:text-justify md:hyphens-auto">
          Questions about our collection, a project in progress, or wholesale
          pricing? Our team is happy to help.
        </p>
        <span aria-hidden className="h-0.5 w-14 bg-gold" />
      </ScrollReveal>

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 lg:grid-cols-[1fr_1.15fr]">
        <ScrollReveal className="flex flex-col gap-4" stagger={0.07} y={16} duration={0.6}>
          {CONTACT_DETAILS.map(({ icon: Icon, title, value, note }) => (
            <div
              key={title}
              className="flex items-start gap-5 rounded-sm border border-border bg-white p-6 transition-colors duration-300 hover:border-gold/50"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-gold">
                <Icon className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-[0.15em] text-ink-muted uppercase">
                  {title}
                </span>
                <span className="text-base font-medium text-ink">{value}</span>
                <span className="text-sm text-ink-muted">{note}</span>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-4 rounded-sm border border-border bg-white p-6 transition-colors duration-300 hover:border-gold/50">
            <div className="flex items-start gap-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-gold">
                <MapPin className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-[0.15em] text-ink-muted uppercase">
                  Our Shops
                </span>
                <span className="text-sm text-ink-muted">
                  Tap a shop to open it in your map app.
                </span>
              </div>
            </div>
            <ul className="flex flex-col gap-3">
              {SHOP_LOCATIONS.map((location) => (
                <li key={location.id}>
                  <a
                    href={mapsUrl(location.mapsQuery, userAgent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-4 rounded-sm border border-border/60 px-4 py-3 transition-colors hover:border-gold/50 hover:bg-secondary/40"
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="text-base font-medium text-ink transition-colors group-hover:text-gold">
                        {location.name}
                      </span>
                      <span className="text-sm text-ink-muted">{location.address}</span>
                    </span>
                    <Navigation className="mt-1 size-4 shrink-0 text-gold" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {whatsappPhone ? (
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                "Hi KMR, I'd like to get in touch."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-sm border border-border bg-white p-6 transition-colors duration-300 hover:border-gold/50"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#25d366]/10 text-[#1fae54] transition-transform duration-300 group-hover:scale-105">
                <WhatsAppIcon className="size-6 fill-current" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-[0.15em] text-ink-muted uppercase">
                  WhatsApp
                </span>
                <span className="text-base font-medium text-ink">
                  Chat with our team directly
                </span>
                <span className="text-sm text-ink-muted">
                  Fastest response, Mon – Sat
                </span>
              </div>
            </a>
          ) : null}
        </ScrollReveal>

        <ContactForm />
      </div>
    </div>
  );
}
