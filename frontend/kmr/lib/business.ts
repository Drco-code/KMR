import { mapsUrl, PRIMARY_LOCATION, SHOP_LOCATIONS } from "@/lib/locations";

// Single source of truth for the business name, address and phone number
// (NAP), so the footer, contact page and LocalBusiness structured data can
// never drift apart. Everything here comes from data already in the repo
// (lib/locations.ts, the WhatsApp env var, the social links already in the
// footer) — nothing is invented. Fields we genuinely don't have are marked
// TODO and simply left out of the schema.

export const BUSINESS_NAME = "KMR City Ventures";

// Shown on the homepage hero artwork ("KMR CITY VENTURES LTD").
export const BUSINESS_LEGAL_NAME: string | null = "KMR City Ventures Ltd";

// The shop number doubles as the WhatsApp number, which is what the site
// already links to (NEXT_PUBLIC_WHATSAPP_NUMBER). Digits only, no "+".
const RAW_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
export const PHONE_DIGITS = RAW_PHONE.replace(/[^\d]/g, "");

// wa.me needs the international number without "+"; tel: needs it with.
export const PHONE_E164 = PHONE_DIGITS ? `+${PHONE_DIGITS}` : "";

export function telHref(): string | null {
  return PHONE_E164 ? `tel:${PHONE_E164}` : null;
}

export function whatsappHref(message?: string): string | null {
  if (!PHONE_DIGITS) return null;
  const base = `https://wa.me/${PHONE_DIGITS}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// "+233555786654" -> "+233 55 578 6654" for display next to the tel: link.
export function phoneDisplay(): string | null {
  if (!PHONE_DIGITS) return null;
  const local = PHONE_DIGITS.startsWith("233")
    ? PHONE_DIGITS.slice(3)
    : PHONE_DIGITS.replace(/^0/, "");
  if (local.length !== 9) return `+${PHONE_DIGITS}`;
  return `+233 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
}

// TODO: confirm this address is the one that should receive enquiries.
export const EMAIL = "hello@kmr.com.gh";

// TODO: confirm opening hours (taken from the contact page copy).
export const OPENING_HOURS_DISPLAY = "Mon – Sat · 8:00am – 6:00pm";
export const OPENING_HOURS_NOTE = "Closed Sundays & public holidays";
export const OPENING_HOURS_SCHEMA = [
  {
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opens: "08:00",
    closes: "18:00",
  },
];

export const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/kmrcityventuresltd?igsh=MXhpazZqZTQzZG5iOA==",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@kmr.city.ventures?_r=1&_t=ZS-98bKtbJVQY5",
  },
];

// The headquarters shop. The other two are branches, listed on the contact
// page and in the footer.
export const HEADQUARTERS = {
  streetAddress: "Kojo Thompson Road, opposite Zenith Bank",
  addressLocality: "Accra",
  addressRegion: "Greater Accra",
  addressCountry: "GH",
};

export const SERVICE_AREA = ["Accra", "Kumasi", "Greater Accra", "Ghana"];

// TODO: add exact shop coordinates if you want a map pin in the schema
// (we only store a place search, not lat/lng, today).
export { PRIMARY_LOCATION, SHOP_LOCATIONS, mapsUrl };
