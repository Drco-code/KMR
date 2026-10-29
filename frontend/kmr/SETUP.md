# Storefront setup — SEO, domain and indexing

Everything SEO-related in this app is driven by two environment variables and
one shared config file (`lib/seo.ts`). Nothing hardcodes the domain.

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (and in a
local `.env.local` — copy `.env.local.example`).

| Variable | Production value | Required |
| --- | --- | --- |
| `SITE_URL` | `https://www.kmr-shop-online.com` | Yes |
| `ALLOW_INDEXING` | `true` | Yes |
| `GOOGLE_SITE_VERIFICATION` | the token from Search Console | No |
| `NEXT_PUBLIC_API_URL` | the NestJS API origin | Yes |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `233555786654` (digits, country code, no `+`) | Yes |

### `SITE_URL`

The single canonical origin, used for:

- `<link rel="canonical">` on every page
- hreflang alternates for locale versions that contain translated content
- `/sitemap.xml` and the `Sitemap:` line in `/robots.txt`
- Open Graph / Twitter URLs and images
- every absolute URL in the JSON-LD (Organization, WebSite, HardwareStore,
  BreadcrumbList, Product…)

Use the `www` host, **no trailing slash**: `https://www.kmr-shop-online.com`.
The bare domain redirects to `www`, so `www` is the version that must be
indexed. `SITE_URL` is required. The app fails clearly when it is missing or
contains a path, query string or hash; this prevents a preview deployment
from ever publishing its `*.vercel.app` hostname as a canonical URL.

### `ALLOW_INDEXING`

Only the exact string `true` makes the site indexable.

- `true` → normal `robots` meta (`index, follow`) on every page and a real
  `/robots.txt` that allows everything except the quote cart, its review step,
  `/api/` and the filtered/sorted catalog URLs, and points at the sitemap.
- anything else (unset, `false`, `TRUE`, `1`) → every page carries
  `<meta name="robots" content="noindex">` and `/robots.txt` is
  `Disallow: /`.

**Set it to `false` for Preview and Development environments in Vercel** so
`*.vercel.app` previews can never be indexed as duplicates of the live site,
and to `true` only for Production.

## Going live checklist

1. In Vercel, set `SITE_URL=https://www.kmr-shop-online.com` for **Production,
   Preview and Development**. Keeping the same canonical origin in every
   environment prevents preview URLs from becoming duplicate canonicals.
2. Set `ALLOW_INDEXING=true` for **Production** and `false` for **Preview** and
   **Development**.
3. Deploy, then confirm `https://www.kmr-shop-online.com/robots.txt` shows
   `Allow: /` plus the `Sitemap:` line, and
   `https://www.kmr-shop-online.com/sitemap.xml` lists your categories and
   products.
4. View source on the homepage and check there is no `noindex` and that the
   canonical points at `https://www.kmr-shop-online.com/`.
5. In [Google Search Console](https://search.google.com/search-console), add
   the **`https://www.kmr-shop-online.com`** property (Domain property is
   best — it needs a DNS record; the URL-prefix property works with the
   `GOOGLE_SITE_VERIFICATION` meta tag instead).
6. Paste the verification token into `GOOGLE_SITE_VERIFICATION`, redeploy, then
   click **Verify** in Search Console.
7. Submit `https://www.kmr-shop-online.com/sitemap.xml` under **Sitemaps**.
8. Use **URL Inspection** on the homepage, `/catalog`, one category and one
   product, and click **Request indexing** for the homepage and `/catalog`.

## How the pieces fit

| File | What it owns |
| --- | --- |
| `lib/seo.ts` | `SITE_URL` / `ALLOW_INDEXING` / verification token, canonical + hreflang builder, the shared `pageMetadata()` helper |
| `lib/business.ts` | Business name, phone, email, address, hours, social links (NAP). Footer, contact page and schema all read from here |
| `lib/schema.ts` | JSON-LD builders: Organization, WebSite (with SearchAction), HardwareStore, BreadcrumbList, CollectionPage/ItemList, Product |
| `lib/category-copy.ts` | The intro copy used on category pages and as their meta description |
| `components/json-ld.tsx` | Escaped `<script type="application/ld+json">` renderer |
| `app/robots.ts` | `/robots.txt` |
| `app/sitemap.xml/route.ts` | `/sitemap.xml` (XML-escaped URLs, safe slugs, hreflang alternates, revalidated hourly) |
| `app/[locale]/not-found.tsx` | The site-branded 404 page |
| `app/not-found.tsx` | Fallback 404 for URLs outside the locale segment |

Every page exports `generateMetadata` and passes `locale`, a locale-independent
`path`, a title and a description to `pageMetadata()`, which fills in the
canonical, hreflang, robots, Open Graph and Twitter tags.

Pages that are deliberately `noindex`: `/quote`, `/quote/review`, and any
catalog URL carrying `?q=` or `?sort=` (they canonicalise to the clean page).
`published` products/categories are never `noindex`.

## Information still needed (placeholders in the code)

These are the only things we could not source from the repo. Each is marked
`TODO` in `lib/business.ts` or `lib/category-copy.ts`:

- **Exact shop coordinates** for `HardwareStore` `geo` (we only store a map
  search query).
- **Registered legal name** — currently inferred as *KMR City Ventures Ltd*
  from the homepage artwork; confirm it.
- **Opening hours** — taken from the contact page copy
  (`Mon – Sat · 8:00am – 6:00pm`). Confirm, including public holidays.
- **Email address** — `hello@kmr.com.gh` comes from the contact page; confirm
  it is the address that should receive enquiries.
- **Phone/WhatsApp number** — read from `NEXT_PUBLIC_WHATSAPP_NUMBER`. Confirm
  it is the shop line, not a personal number.
- **Product `brand` and `sku`** — not columns in the Prisma `Product` model, so
  the Product schema omits both. Add them to the schema if you want the fuller
  product rich result.
- **Stock availability** — `stock` is staff-only; no availability is claimed in
  the Product offer.
- **Category descriptions** — the four top-level categories have real copy in
  `lib/category-copy.ts`; subcategories use a factual one-liner built from
  their name. Add per-category copy there if you want richer pages.
- **Social profiles** — Instagram and TikTok are taken from the footer. Add
  Google Business Profile / Facebook URLs to `SOCIAL_LINKS` if they exist.

## How to test the markup

- **Rich Results Test** — <https://search.google.com/test/rich-results> → paste
  a product URL (`/product/<slug>`), a category URL and the homepage. Expected:
  `Product`, `BreadcrumbList` on inner pages, `Organization` / `WebSite` /
  `HardwareStore` on the homepage, no errors.
- **Schema Markup Validator** — <https://validator.schema.org> catches
  vocabulary mistakes the Rich Results Test ignores.
- **PageSpeed Insights** — <https://pagespeed.web.dev> on the homepage and a
  product page, mobile first.
- **Search Console → URL Inspection** — check "Page is indexed", "User-declared
  canonical" (must be the `www` URL) and the "Enhancements" sections.
