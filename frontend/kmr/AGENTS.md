# KMR Storefront

## Overview

This package is the public KMR City Ventures storefront. It is a Next.js App Router application that reads catalog data from the NestJS API, supports localized routes, and lets customers build a quote cart before handing off to WhatsApp.

## Key files

| File | Owns |
|---|---|
| `app/[locale]/layout.tsx` | Locale validation, fonts, translations, and shared shell |
| `app/` | App Router pages, loading states, and localized route mirrors |
| `components/` | Header, navigation, catalog, quote, and presentation components |
| `lib/api/client.ts` | Typed requests to the backend API |
| `lib/api/types.ts` | Frontend representations of API responses |
| `lib/store/quote-cart.ts` | Zustand quote cart state |
| `i18n/routing.ts` | Supported locales and URL prefix behavior |
| `messages/` | English, Arabic, Chinese, and Turkish translations |
| `proxy.ts` | next-intl request middleware |
| `app/globals.css` | Tailwind theme and KMR visual tokens |

## Commands

Run from this directory.

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Conventions

- Use the App Router and server components by default. Add client components only for browser state, events, or animation.
- Use `@/` imports and keep API access in `lib/api/client.ts` rather than scattering fetch calls through pages.
- Keep API response types in `lib/api/types.ts` synchronized with backend public response shapes.
- Use `next-intl` routing and translation messages for user facing localized content.
- Preserve the KMR black, cream, and gold visual system in `app/globals.css`.
- Use `cache: "no-store"` for live catalog and quote related API calls.
- Keep quote cart interaction in Zustand and preserve the WhatsApp handoff after quote submission.
- Remote images must match the allowlist in `next.config.ts`.

## Gotchas

- English uses `localePrefix: "as-needed"`, so `/` is English while other locales use a locale segment.
- The root layout is intentionally minimal. The real document shell is in `app/[locale]/layout.tsx`.
- Arabic is right to left. Keep the `dir` calculation and locale validation in the locale layout.
- The server-side backend URL comes from `KMR_API_URL`, with `NEXT_PUBLIC_API_URL` read only as a legacy fallback; WhatsApp links use `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- The storefront filters inactive products and brands on the client API wrapper, while the API also omits staff only fields.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite._
