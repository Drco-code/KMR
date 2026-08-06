# Homepage Imagery & Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the currently imageless, flat-color homepage sections (hero, "Pigment Science," consultancy teasers, grayscale brand logos) with placeholder photography and copy that reflects that KMR sells both paint and hardware, not paint alone.

**Architecture:** Pure frontend change in `frontend/kmr`. No backend, schema, or API changes. Placeholder images are hotlinked from `images.unsplash.com` via `next/image`, following the same `fill` + `object-cover` pattern already used by `ProductImageCarousel`/`ProductCard`. Copy and layout changes live in `app/page.tsx`; the grayscale removal lives in `components/brand-strip.tsx`.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, `next/image`.

## Global Constraints

- No new npm dependencies (spec: "No new npm dependencies").
- Placeholder images are hotlinked from `images.unsplash.com`, not committed as binary files (spec: "Approach").
- Keep the existing black/ink/gold editorial design system as-is — no structural/marketplace-style overhaul (spec: "Non-goals").
- Text over any new background image must stay at the same legibility/contrast the section has today — dark gradient/overlay required behind white text (spec: sections 1–3).
- This machine's `E:` drive is exFAT, which breaks Turbopack — verification commands must use `npx next build --webpack`, not the default `next build`/`next dev` (established earlier in this project; not in the spec file itself, but a hard environment constraint for this repo right now).
- No test framework exists in `frontend/kmr` (`package.json` has no `jest`/`vitest`/testing-library). Verification per task is `npm run lint` + `npx next build --webpack`, not unit tests.

---

## File Structure

- **Modify** `frontend/kmr/next.config.ts` — add `images.unsplash.com` to `images.remotePatterns`.
- **Modify** `frontend/kmr/app/page.tsx` — hero section (image + copy + CTA labels), "Pigment Science" → "Craftsmanship & Performance" section (rename, copy, two-column layout), `ConsultancyTeaser` component (new `image` prop, per-card background image), both `<ConsultancyTeaser>` call sites (pass image URLs).
- **Modify** `frontend/kmr/components/brand-strip.tsx` — remove the forced-grayscale classes from the logo `<Image>`.

No new files are created.

---

### Task 1: Allow Unsplash as an image source

**Files:**
- Modify: `frontend/kmr/next.config.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `images.unsplash.com` becomes a valid `next/image` `src` host for every later task in this plan. Later tasks use URLs of the exact shape `https://images.unsplash.com/photo-<id>?w=<n>&q=80&fit=crop&auto=format`.

- [ ] **Step 1: Add the remote pattern**

Current file (`frontend/kmr/next.config.ts`):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
```

Change to:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify the config file is valid**

Run: `cd frontend/kmr && npx tsc --noEmit next.config.ts` — expected: no output (no type errors). If that command complains about an isolated single-file check being unsupported, instead run the full build in Step 3 below to confirm the config loads.

- [ ] **Step 3: Commit**

```bash
git add frontend/kmr/next.config.ts
git commit -m "Allow images.unsplash.com as a next/image source"
```

---

### Task 2: Hero section — image, headline, body copy, CTA labels

**Files:**
- Modify: `frontend/kmr/app/page.tsx:19-56` (the hero `<section>`)

**Interfaces:**
- Consumes: `images.unsplash.com` allowed as an image host (Task 1)
- Produces: nothing consumed by later tasks — this section is self-contained

- [ ] **Step 1: Add the `Image` import**

At the top of `app/page.tsx`, alongside the existing imports:

```tsx
import Image from "next/image";
```

- [ ] **Step 2: Replace the hero section markup**

Current (`app/page.tsx:21-56`):

```tsx
      <section className="relative flex h-[560px] items-center justify-center overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/90 to-black" />
        <div className="absolute inset-0 bg-black/30" />
        <ScrollReveal
          className="relative flex max-w-3xl flex-col items-center gap-8 px-6 text-center"
          stagger={0.15}
          y={20}
          duration={0.8}
        >
          <TextReveal
            as="h1"
            className="font-display text-5xl leading-tight font-bold text-white md:text-6xl"
          >
            The Art of Living in Color
          </TextReveal>
          <p className="max-w-xl text-lg text-white/90">
            Premium architectural coatings and artisanal pigments for the
            modern home. Discover a collection designed for those who value
            heritage and innovation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/catalog"
              className="rounded-sm bg-black px-10 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase shadow-lg transition-opacity hover:opacity-90"
            >
              Explore Palette
            </Link>
            <Link
              href="/quote"
              className="rounded-sm border border-white px-10 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:bg-white hover:text-ink"
            >
              Order Swatches
            </Link>
          </div>
        </ScrollReveal>
      </section>
```

Replace with:

```tsx
      <section className="relative flex h-[560px] items-center justify-center overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80&fit=crop&auto=format"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/90 to-black" />
        <div className="absolute inset-0 bg-black/30" />
        <ScrollReveal
          className="relative flex max-w-3xl flex-col items-center gap-8 px-6 text-center"
          stagger={0.15}
          y={20}
          duration={0.8}
        >
          <TextReveal
            as="h1"
            className="font-display text-5xl leading-tight font-bold text-white md:text-6xl"
          >
            Everything for the Build, Beautifully Made
          </TextReveal>
          <p className="max-w-xl text-lg text-white/90">
            Premium paints, tools, and hardware for those who care how it's
            built — and how it looks when it's done.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/catalog"
              className="rounded-sm bg-black px-10 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase shadow-lg transition-opacity hover:opacity-90"
            >
              Explore Catalog
            </Link>
            <Link
              href="/quote"
              className="rounded-sm border border-white px-10 py-4 text-sm font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:bg-white hover:text-ink"
            >
              Get a Quote
            </Link>
          </div>
        </ScrollReveal>
      </section>
```

Note: `alt=""` is correct here (not a missing-alt bug) — this is a purely decorative background image behind readable text content; screen readers should skip it.

- [ ] **Step 3: Verify**

Run: `cd frontend/kmr && npm run lint` — expected: no errors.
Run: `cd frontend/kmr && npx next build --webpack` — expected: build succeeds, no type errors, no "Module not found" or image-domain errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/kmr/app/page.tsx
git commit -m "Add hero background photo and broaden hero copy beyond paint-only"
```

---

### Task 3: "Pigment Science" → "Craftsmanship & Performance" section

**Files:**
- Modify: `frontend/kmr/app/page.tsx:70-91` (the second `<section>`, currently `bg-black`)

**Interfaces:**
- Consumes: `images.unsplash.com` allowed as an image host (Task 1), `Image` import added in Task 2 (same file)
- Produces: nothing consumed by later tasks — this section is self-contained

- [ ] **Step 1: Replace the section markup**

Current (`app/page.tsx:70-91`):

```tsx
      <section className="bg-black px-6 py-24 md:px-20 md:py-30">
        <ScrollReveal className="mx-auto flex max-w-[1440px] flex-col items-start gap-6">
          <span className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">
            Pigment Science
          </span>
          <h2 className="font-display text-4xl text-white md:text-5xl">
            Architectural Grade Performance.
          </h2>
          <p className="max-w-xl text-lg text-white/60">
            We don&apos;t just sell paint; we engineer light. Our patented
            pigments offer unparalleled depth and color stability, ensuring
            your home remains vibrant for decades. Zero-VOC, eco-certified,
            and artist-curated.
          </p>
          <Link
            href="/catalog"
            className="mt-2 rounded-sm bg-gold px-8 py-3 text-sm font-semibold tracking-[0.05em] text-white uppercase hover:opacity-90"
          >
            Learn More
          </Link>
        </ScrollReveal>
      </section>
```

Replace with:

```tsx
      <section className="bg-black px-6 py-24 md:px-20 md:py-30">
        <ScrollReveal className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80&fit=crop&auto=format"
              alt="Welder at work, sparks flying"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="flex flex-col items-start gap-6">
            <span className="text-xs font-medium tracking-[0.2em] text-gold-light uppercase">
              Craftsmanship &amp; Performance
            </span>
            <h2 className="font-display text-4xl text-white md:text-5xl">
              Built for the Job, Made to Last.
            </h2>
            <p className="max-w-xl text-lg text-white/60">
              From premium coatings to professional-grade tools, every
              product is chosen for durability and performance — vetted by
              people who use this stuff, not just sell it.
            </p>
            <Link
              href="/catalog"
              className="mt-2 rounded-sm bg-gold px-8 py-3 text-sm font-semibold tracking-[0.05em] text-white uppercase hover:opacity-90"
            >
              Learn More
            </Link>
          </div>
        </ScrollReveal>
      </section>
```

Note: this image has real informational content (a person welding), unlike the purely decorative hero photo, so it gets a descriptive `alt`, not `alt=""`.

- [ ] **Step 2: Verify**

Run: `cd frontend/kmr && npm run lint` — expected: no errors.
Run: `cd frontend/kmr && npx next build --webpack` — expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/kmr/app/page.tsx
git commit -m "Rework Pigment Science section into Craftsmanship & Performance with photo"
```

---

### Task 4: Consultancy teaser cards get background photos

**Files:**
- Modify: `frontend/kmr/app/page.tsx:93-137` (the consultancy `<section>` and the `ConsultancyTeaser` component)

**Interfaces:**
- Consumes: `images.unsplash.com` allowed as an image host (Task 1), `Image` import added in Task 2 (same file)
- Produces: `ConsultancyTeaser` now requires an `image: string` prop. Nothing outside this file renders `ConsultancyTeaser` (verified: it's a local, non-exported function in `page.tsx`), so no other call sites need updating.

- [ ] **Step 1: Update the two call sites**

Current (`app/page.tsx:97-108`):

```tsx
        <ScrollReveal className="flex flex-col gap-6 md:flex-row" stagger={0.15} y={24}>
          <ConsultancyTeaser
            title="Color Matching"
            description="Our experts use spectro-analysis to match any sample, from a scrap of silk to a sunset photograph."
            cta="Start Matching"
          />
          <ConsultancyTeaser
            title="Professional Application"
            description="Access our network of KMR certified master painters for a flawless, architectural finish."
            cta="Book Application"
          />
        </ScrollReveal>
```

Replace with:

```tsx
        <ScrollReveal className="flex flex-col gap-6 md:flex-row" stagger={0.15} y={24}>
          <ConsultancyTeaser
            title="Color Matching"
            description="Our experts use spectro-analysis to match any sample, from a scrap of silk to a sunset photograph."
            cta="Start Matching"
            image="https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80&fit=crop&auto=format"
          />
          <ConsultancyTeaser
            title="Professional Application"
            description="Access our network of KMR certified master painters for a flawless, architectural finish."
            cta="Book Application"
            image="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80&fit=crop&auto=format"
          />
        </ScrollReveal>
```

- [ ] **Step 2: Update the `ConsultancyTeaser` component**

Current (`app/page.tsx:116-137`):

```tsx
function ConsultancyTeaser({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-4 bg-ink p-10 min-h-[360px]">
      <h3 className="font-display text-3xl text-white">{title}</h3>
      <p className="text-white/80">{description}</p>
      <Link
        href="/consultancy"
        className="text-sm font-semibold tracking-[0.05em] text-gold-light uppercase"
      >
        {cta} →
      </Link>
    </div>
  );
}
```

Replace with:

```tsx
function ConsultancyTeaser({
  title,
  description,
  cta,
  image,
}: {
  title: string;
  description: string;
  cta: string;
  image: string;
}) {
  return (
    <div className="relative flex flex-1 flex-col justify-end gap-4 overflow-hidden bg-ink p-10 min-h-[360px]">
      <Image
        src={image}
        alt=""
        fill
        className="object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
      <div className="absolute inset-0 bg-black/50" />
      <h3 className="relative font-display text-3xl text-white">{title}</h3>
      <p className="relative text-white/80">{description}</p>
      <Link
        href="/consultancy"
        className="relative text-sm font-semibold tracking-[0.05em] text-gold-light uppercase"
      >
        {cta} →
      </Link>
    </div>
  );
}
```

Note: `h3`, `p`, and the `Link` all gain `relative` so they stack above the absolutely-positioned image and overlay (which are not `relative`, so they'd otherwise sit on top in DOM/paint order without being pulled into the stacking context correctly — `relative` on the text elements plus the parent's `relative` ensures correct z-ordering without needing explicit `z-index`).

- [ ] **Step 3: Verify**

Run: `cd frontend/kmr && npm run lint` — expected: no errors.
Run: `cd frontend/kmr && npx next build --webpack` — expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add frontend/kmr/app/page.tsx
git commit -m "Add background photos to consultancy teaser cards"
```

---

### Task 5: Brand logos render in natural color

**Files:**
- Modify: `frontend/kmr/components/brand-strip.tsx:35`

**Interfaces:**
- Consumes: nothing
- Produces: nothing consumed by later tasks — this is the final task in the plan

- [ ] **Step 1: Remove the grayscale classes**

Current (`components/brand-strip.tsx:29-37`):

```tsx
          const image = (
            <Image
              src={cloudinaryUrl(logo, 400)}
              alt={brand.name}
              width={220}
              height={88}
              className="h-16 w-auto max-w-[180px] object-contain grayscale transition-all duration-300 hover:grayscale-0 md:h-20"
            />
          );
```

Replace with:

```tsx
          const image = (
            <Image
              src={cloudinaryUrl(logo, 400)}
              alt={brand.name}
              width={220}
              height={88}
              className="h-16 w-auto max-w-[180px] object-contain md:h-20"
            />
          );
```

- [ ] **Step 2: Verify**

Run: `cd frontend/kmr && npm run lint` — expected: no errors.
Run: `cd frontend/kmr && npx next build --webpack` — expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/kmr/components/brand-strip.tsx
git commit -m "Show brand logos in their natural color instead of forced grayscale"
```

---

## Final Verification

After all 5 tasks are committed:

- [ ] Run `cd frontend/kmr && npx next build --webpack` one more time end-to-end — expected: clean build, no errors.
- [ ] Run `cd frontend/kmr && npm run dev -- --webpack` (or deploy to a preview environment, given this machine's exFAT/Turbopack limitation) and visually check `/`:
  - Hero photo loads, headline/body text is legible against it at both mobile and desktop widths
  - "Craftsmanship & Performance" section shows the welder photo beside the text on desktop, stacks on mobile
  - Both consultancy cards show their background photos with legible white text
  - Brand logos (if any brands have logos seeded) render in color, not grayscale
