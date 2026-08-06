# Homepage Imagery & Positioning

## Context

The homepage (`frontend/kmr/app/page.tsx`) currently reads as entirely
black-and-white: the hero, "Pigment Science" section, and both consultancy
teaser cards are flat `bg-ink`/`bg-black` color blocks with no photography,
and brand logos are forced grayscale (`grayscale` class, color only on
hover). Separately, the copy is written as if KMR sells paint exclusively
("The Art of Living in Color," "Pigment Science," "Explore Palette," "Order
Swatches"), but the seeded product catalog (`prisma/seed-categories.ts`)
shows they also sell hardware — power tools, hand tools, tool storage,
measuring/marking tools, etc.

The client has no real photography yet and won't until this direction is
shown to them. This spec covers a placeholder-imagery pass so the homepage
can be demoed, plus broadening the copy to reflect the real catalog. Real
photography swaps in later without any code changes beyond updating URLs —
that's explicitly out of scope here.

## Non-goals

- No structural/layout overhaul (no marketplace-style trust badges, brand
  carousels, or dense category grids — the existing black/ink/gold editorial
  design system stays as-is, just no longer imageless)
- No changes to the product catalog, categories, or AdminJS
- No new npm dependencies
- Real photography sourcing/upload is a separate future task

## Approach

Keep the existing premium/editorial visual system. Replace flat color
blocks with photography, and broaden copy so it doesn't read as paint-only.
Placeholder images are hotlinked from `images.unsplash.com` (verified
reachable from this environment) via `next/image` `remotePatterns`, rather
than committed as binary files — trivial to swap for real assets later,
and no repo bloat from throwaway placeholders.

## Image selections

All four verified reachable and visually confirmed to match intent:

| Section | Unsplash photo ID | Why |
|---|---|---|
| Hero | `1600607687939-ce8a6c25118c` | Warm living room, wood accent wall, framed art — matches "living in color," reads premium |
| Craftsmanship & Performance | `1504328345606-18bbc8c9d7d1` | Welder with sparks — industrial/hardware-coded, balances the paint-only tone |
| Color Matching card | `1567016432779-094069958ea5` | Rust sofa + textiles, color-forward styling — visually ties to color matching |
| Professional Application card | `1581578731548-c64695cc6952` | Person painting a window shutter — directly depicts hands-on application work |

Full-size URLs use Unsplash's `?w=<n>&q=80&fit=crop&auto=format` query
params for reasonably sized delivery (Unsplash serves resized JPEGs on
demand from these params, no extra tooling needed). Exact widths are an
implementation detail decided per section during implementation, not fixed
here.

## Section-by-section changes

### 1. Hero (`app/page.tsx`, top `<section>`)

- Replace the flat `bg-ink` + gradient overlay with the hero photo as a
  background image, keeping a dark gradient/overlay on top (same
  `from-ink via-ink/90 to-black` + `bg-black/30` treatment) so the existing
  white headline/body text stays legible at the same contrast it has today.
- Headline changes from *"The Art of Living in Color"* to *"Everything for
  the Build, Beautifully Made"* — keeps the editorial tone, reads as
  paint + hardware rather than paint-only.
- Body copy changes from paint/pigment-specific wording to: *"Premium
  paints, tools, and hardware for those who care how it's built — and how
  it looks when it's done."*
- CTA labels change: "Explore Palette" → "Explore Catalog", "Order
  Swatches" → "Get a Quote" (both keep their existing `href`s — `/catalog`
  and `/quote` — only the label text changes, since "Order Swatches" implies
  a paint-only action that doesn't fit tools/hardware).

### 2. "Pigment Science" section → "Craftsmanship & Performance"

- Eyebrow label changes from "Pigment Science" to "Craftsmanship &
  Performance".
- Headline changes from *"Architectural Grade Performance."* to
  *"Built for the Job, Made to Last."*
- Body copy changes from pigment-specific wording ("We don't just sell
  paint; we engineer light...") to: *"From premium coatings to
  professional-grade tools, every product is chosen for durability and
  performance — vetted by people who use this stuff, not just sell it."*
- Layout changes from a single centered text block on flat `bg-black` to a
  two-column layout on `md:` breakpoints: the welder photo on one side,
  text + CTA on the other, still on a dark background for contrast
  (`bg-black` retained behind/around the image, image itself is not
  full-bleed — keeps the existing section rhythm of alternating
  light/dark sections).
- CTA label unchanged ("Learn More" → stays, still links to `/catalog`).

### 3. Consultancy teasers (`ConsultancyTeaser` component)

- Both cards currently render `bg-ink` solid color with text anchored to
  the bottom (`justify-end`). Add a `next/image` with `fill` per-card
  (see Technical Details), with a dark overlay (`bg-black/50` or similar)
  between the image and the text so the existing white text stays legible
  at current contrast.
- `ConsultancyTeaser` component gains an `image` prop (Unsplash URL),
  passed per-card from `page.tsx`:
  - Color Matching → rust sofa/textiles photo
  - Professional Application → painter-at-work photo
- Copy (title/description/cta) is unchanged — these already read fine for
  a paint+hardware store ("Color Matching," "Professional Application").

### 4. Brand strip (`components/brand-strip.tsx`)

- Remove `grayscale transition-all duration-300 hover:grayscale-0` from
  the logo `<Image>` className, leaving just `h-16 w-auto max-w-[180px]
  object-contain md:h-20`. Logos render in their natural color at all
  times.

### 5. "Signature Collections" section

- No changes. This section already reads generically (shows featured
  products, whatever category they're in) and doesn't need copy or image
  changes.

## Technical details

- `frontend/kmr/next.config.ts`: add `images.unsplash.com` to
  `images.remotePatterns` (same shape as the existing `res.cloudinary.com`
  entry).
- Hero and "Craftsmanship & Performance" background photos: implemented as
  an absolutely-positioned `next/image` with `fill` + `object-cover`
  behind the existing overlay/content, matching the pattern already used
  in `ProductImageCarousel`/`ProductCard` elsewhere in the codebase,
  rather than a CSS `background-image` — keeps things consistent with how
  images are handled everywhere else in this frontend.
- Consultancy teaser images: same `fill` + `object-cover` pattern, card
  container gets `relative` + `overflow-hidden`.

## Testing / verification

- `npm run build` (or `next build --webpack`, per the earlier exFAT
  finding on this machine) to confirm no type/lint errors and that image
  domains resolve.
- Manual visual check via `npm run dev` (or a deployed preview, given the
  local exFAT/Turbopack build issue) — confirm text contrast/legibility
  over each new background image at both mobile and desktop widths, and
  confirm brand logos render in color.

## Out of scope / follow-ups

- Swapping placeholder Unsplash photos for real client photography once
  provided — a config/URL change only, no structural changes needed.
- Any deeper homepage restructuring (new sections, trust badges, category
  grid) if the client wants to move toward a more Supply-Master-style
  marketplace layout — that would be its own spec.
- Marking real products as `isFeatured` in AdminJS so "Signature
  Collections" shows curated picks instead of the recency fallback.
