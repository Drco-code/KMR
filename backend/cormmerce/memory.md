# Memory — AdminJS Dashboard Wiring

Last updated: 2026-07-31

## What was built

Fixed and verified the AdminJS staff dashboard (built in an earlier, unsaved session) end-to-end:

- `src/admin-module/admin-module.service.ts` — AdminJS router over `Category`/`Product`/`QuoteRequest`/`QuoteRequestItem`, gated by the same Better Auth session cookie as the rest of the API (custom `/admin/login` HTML page posts to `/api/auth/sign-in/email`). Uses a second, legacy-generator Prisma client (`generated/prisma-legacy`, via `prisma-client-js`) purely so `@adminjs/prisma` can read `Prisma.dmmf.datamodel` — real reads/writes still go through `PrismaModuleService` (main `prisma-client` generator output).
- Wired into `main.ts` as raw Express middleware on `/admin` (outside Nest routing, since AdminJS needs to own that path) and into `app.module.ts` via `AdminModuleModule`.
- `nest-cli.json` — added a `compilerOptions.assets` entry copying `../generated/prisma-legacy/**/*` to `dist/generated` (not `dist/generated/prisma-legacy` — that nests it one level too deep; nest-cli's glob output path already includes the trailing `prisma-legacy` segment). Needed because `prisma-legacy` is a precompiled JS client (not `.ts` source), so plain `tsc`/`nest build` never copies it into `dist` on its own — unlike the main `generated/prisma` client, which is `.ts` source and gets compiled in place.
- `package.json` — added `express-session` + `@types/express-session` (undeclared peer dependency of `@adminjs/express`, caused an `ERR_MODULE_NOT_FOUND` on boot without it).

## Decisions made

- AdminJS gets a minimal `dmmfShim` (`{ Prisma: { dmmf: { datamodel } } }`) instead of the real `adminJsMetadataClient` module wherever `@adminjs/prisma` expects a `clientModule` — see Problems solved below for why. Verified by reading `@adminjs/prisma`'s source (`get-model-by-name.js`, `get-enums.js`, `Database.js`) that it never reads anything else off `clientModule`.

## Problems solved

- **Legacy Prisma client never generated with real runtime files.** `generated/prisma-legacy` had only `.d.ts` files, no `.js` — a prior `npx prisma generate` had apparently only partially completed. Fixed by re-running `npx prisma generate` (regenerates both the main and legacy clients from `prisma/schema.prisma`).
- **`new AdminJS(...)` crashed with `TypeError: Invalid enum value: length`.** Root cause: AdminJS's constructor does a deep `lodash.merge` over its entire options object, including our `resources[].resource.clientModule`. That module is the full legacy Prisma client namespace, which exports enum objects (`Prisma.SortOrder`, `Prisma.ModelName`, etc.) wrapped in Prisma 6's strict-enum `Proxy` — it throws on any unrecognized property access, including lodash's routine `.length`/`isArrayLike` probe during traversal. The main `generated/prisma` client (newer `prisma-client` generator, TS output) does **not** have this guard, so `client: this.prisma` was never the problem — only `clientModule`. Fixed by building a minimal `dmmfShim` object exposing only `Prisma.dmmf.datamodel` and passing that instead of the real module everywhere `@adminjs/prisma` wants a `clientModule`.
- **`dist/generated/prisma-legacy` missing at runtime** even after `nest build` succeeded — `require('../../generated/prisma-legacy')` resolved fine for `tsc --noEmit` (checked relative to `src/`) but not at actual runtime (resolved relative to `dist/src/admin-module`, and nothing had ever copied the precompiled legacy client into `dist`). Fixed via the `nest-cli.json` assets entry above — took two tries to get the `outDir` value right (`dist/generated`, not `dist/generated/prisma-legacy`).
- **`EADDRINUSE :::3000`** during testing — a previous `timeout N node dist/src/main.js` background test process didn't fully die when its timeout expired. Had to find and kill it via `Get-NetTCPConnection -LocalPort 3000` / `Stop-Process` before the next server start would bind successfully. Not a code bug, just a leftover local process — worth remembering if `EADDRINUSE` shows up again while iterating.

## Current state

Everything verified working end-to-end against a live server (Prisma dev Postgres + `node dist/src/main.js`):
- Server boots clean, no crash.
- `GET /admin` with no session → `302` to `/admin/login`.
- `GET /admin/login` → `200`, HTML sign-in form.
- Signing in via `POST /api/auth/sign-in/email` → `200` with session cookie.
- That cookie against `GET /admin` → `200` (dashboard).
- Same cookie also unlocks other admin-only routes (`POST /category-module` → `400` validation error instead of `401`).
- Public catalog `GET`s and quote-request `POST` still work with no session (unaffected by this work).
- Temporary verification staff account (`admin-verify-tmp@example.com`) was created and then fully deleted (user + sessions + accounts rows) — no test data left in the DB.
- `.env` still has empty `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` placeholders — the user still needs to fill these in and run `npx tsx prisma/seed.ts` to create their real first staff account (this was already true before this session, not introduced by it).

Both the local Prisma Postgres dev server (`npx prisma dev`) and the Nest app (`npm run start`) were left running in the background at the end of this session, in case the user wants to keep poking at `/admin` immediately.

## Next session starts with

Nothing blocking on the AdminJS dashboard itself — it's complete and verified. Two known pre-existing gaps, unrelated to this session's work but worth knowing before assuming CRUD elsewhere persists data:
- `quote-request-module.service.ts` still has stub `update`/`remove` methods (`return 'This action updates/removes a #${id}...'`) — never wired to Prisma. Category/product modules are likely similar and haven't been checked.
- If continuing dashboard work: no manual browser click-through of the AdminJS UI itself (resource list/edit screens) has been done yet — only HTTP-level route/status verification. Worth doing a visual pass if the user wants to see it rendered.

## Open questions

None outstanding for this AdminJS fix itself.
