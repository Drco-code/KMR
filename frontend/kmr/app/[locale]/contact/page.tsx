import type { Metadata } from "next";
import { headers } from "next/headers";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ContactForm } from "@/components/contact-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { mapsUrl, SHOP_LOCATIONS } from "@/lib/locations";
import {
  BUSINESS_NAME,
  EMAIL,
  OPENING_HOURS_DISPLAY,
  OPENING_HOURS_NOTE,
  phoneDisplay,
  telHref,
  whatsappHref,
} from "@/lib/business";
import { breadcrumbSchema, hardwareStoreSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return pageMetadata({
    locale,
    path: "/contact",
    title: t("contactTitle"),
    description: t("contactDescription"),
  });
}

// Shop addresses live in lib/locations.ts (shared with the footer), so this
// list only holds the generic contact details. The phone number comes from the
// same env var the WhatsApp links use, so the number can't drift.
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const phone = phoneDisplay();
  const phoneLink = telHref();
  const whatsapp = whatsappHref("Hi KMR, I'd like to get in touch.");
  // Picks Apple Maps on Apple devices, Google Maps everywhere else.
  const userAgent = (await headers()).get("user-agent");

  const crumbs = [
    { name: tNav("home"), path: "/" },
    { name: "Contact", path: "/contact" },
  ];

  const CONTACT_DETAILS = [
    ...(phone && phoneLink
      ? [
          {
            icon: Phone,
            title: "Phone",
            value: phone,
            href: phoneLink,
            note: "Call or text, Mon – Sat",
          },
        ]
      : []),
    {
      icon: Mail,
      title: "Email",
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      note: "We reply within 24 hours",
    },
    {
      icon: Clock,
      title: "Hours",
      value: OPENING_HOURS_DISPLAY,
      note: OPENING_HOURS_NOTE,
    },
  ];

  return (
    <div className="flex flex-col gap-16 px-6 py-16 md:px-20 md:py-24">
      <JsonLd data={hardwareStoreSchema(locale)} />
      <JsonLd data={breadcrumbSchema(locale, crumbs)} />
      <div className="flex flex-col gap-8">
        <Breadcrumbs items={crumbs} />
        <ScrollReveal className="flex flex-col items-center gap-4 text-center">
          <span className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            Get In Touch
          </span>
          <h1 className="font-display text-4xl text-ink md:text-5xl">Contact Us</h1>
          <p className="max-w-xl text-lg text-ink-muted md:text-justify md:hyphens-auto">
            Questions about our collection, a project in progress, or wholesale
            pricing? Our team is happy to help. {BUSINESS_NAME} has shops in
            Accra and Kumasi, and delivers across Ghana.
          </p>
          <span aria-hidden className="h-0.5 w-14 bg-gold" />
        </ScrollReveal>
      </div>

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 lg:grid-cols-[1fr_1.15fr]">
        <ScrollReveal className="flex flex-col gap-4" stagger={0.07} y={16} duration={0.6}>
          {CONTACT_DETAILS.map(({ icon: Icon, title, value, href, note }) => (
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
                {href ? (
                  <a
                    href={href}
                    className="text-base font-medium text-ink transition-colors hover:text-gold"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-base font-medium text-ink">{value}</span>
                )}
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

          {whatsapp ? (
            <a
              href={whatsapp}
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
