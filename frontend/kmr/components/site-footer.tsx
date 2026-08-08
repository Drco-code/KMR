import Link from "next/link";
import { MapPin } from "lucide-react";
import { getContactInfo } from "@/lib/api/client";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/kmrcityventuresltd?igsh=MXhpazZqZTQzZG5iOA==",
    icon: InstagramIcon,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@kmr.city.ventures?_r=1&_t=ZS-98bKtbJVQY5",
    icon: TikTokIcon,
  },
];

const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { href: "/catalog", label: "Full Catalog" },
      { href: "/catalog", label: "Interior Enamels" },
      { href: "/catalog", label: "Exterior Coatings" },
      { href: "/catalog", label: "Specialty Finishes" },
    ],
  },
  {
    heading: "Service",
    links: [
      { href: "/consultancy", label: "Color Matching" },
      { href: "/consultancy", label: "Professional Application" },
      { href: "/consultancy", label: "Project Specs" },
    ],
  },
  {
    heading: "Support",
    links: [
      { href: "/quote", label: "Request a Quote" },
      { href: "/consultancy", label: "Consultancy" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

export async function SiteFooter() {
  // Address + mini map are staff-editable (ContactInfo singleton in the
  // admin dashboard) — the block hides when either is unset.
  const contactInfo = await getContactInfo();
  const showLocation = Boolean(contactInfo?.address || contactInfo?.mapEmbedUrl);

  return (
    <footer className="bg-[#e2e2e2] px-6 py-16 md:px-20 md:py-24">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16">
        <div
          className={`grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 ${
            showLocation ? "lg:grid-cols-6" : "lg:grid-cols-4"
          }`}
        >
          <div className="flex flex-col gap-6">
            <span className="font-display text-2xl font-semibold text-ink">
              KMR
            </span>
            <p className="text-sm text-ink/70">
              Defining spaces through color. Premium architectural coatings
              and artisanal pigments.
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-4">
              <h5 className="text-xs font-semibold tracking-[0.15em] text-ink uppercase">
                {column.heading}
              </h5>
              {column.links.map((link, i) => (
                <Link
                  key={`${link.href}-${i}`}
                  href={link.href}
                  className="text-sm text-ink hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {showLocation ? (
            // The location column gets double width on desktop (lg:col-span-2)
            // so the mini map renders big enough to be useful.
            <div className="flex flex-col gap-4 lg:col-span-2">
              <h5 className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-ink uppercase">
                <MapPin className="size-3.5 text-gold" />
                Visit Us
              </h5>
              {contactInfo.address ? (
                <p className="text-sm leading-relaxed text-ink/70">
                  {contactInfo.address}
                </p>
              ) : null}
              {contactInfo.mapEmbedUrl ? (
                // Admin-supplied iframe src (Google Maps embed or OpenStreetMap
                // embed). Muted grayscale by default; color on hover.
                <iframe
                  src={contactInfo.mapEmbedUrl}
                  title="KMR location map"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-52 w-full rounded-sm border border-ink/10 grayscale transition-all duration-500 hover:grayscale-0 md:h-56"
                />
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="border-t border-ink/10 pt-8 text-center">
          <p className="text-xs tracking-[0.1em] text-ink/60 uppercase">
            © {new Date().getFullYear()} KMR Architectural Coatings. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// lucide-react doesn't ship trademarked brand logos, so these are hand-drawn
// to match the official glyphs at a stroke weight consistent with the rest
// of the icon set.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 2h-3.1v13.6a2.9 2.9 0 1 1-2.06-2.78V9.6a6.1 6.1 0 1 0 5.16 6.03V9.28a7.9 7.9 0 0 0 4.5 1.4V7.55a4.7 4.7 0 0 1-4.5-4.6V2Z" />
    </svg>
  );
}
