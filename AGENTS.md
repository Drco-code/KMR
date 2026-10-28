# Cormmerce

## Stack

- **Language / Runtime**: TypeScript on Node.js
- **Framework**: NestJS 11 API and Next.js 16 App Router storefront
- **Key dependencies**: Prisma 6 with PostgreSQL, Better Auth, AdminJS, Cloudinary, next-intl
- **Package manager**: npm, with separate manifests in `backend/cormmerce` and `frontend/kmr`

## Build approach

Incremental vertical slices, keep the API, storefront, database, and admin path working together.

## Commands

```bash
# Backend development
cd backend/cormmerce
npm run start:dev

# Backend build and tests
npm run build
npm run test

# Frontend development
cd frontend/kmr
npm run dev

# Frontend build and lint
npm run build
npm run lint
```

## Specs

Stored in `docs/specs/` and `docs/superpowers/specs/`. Plans are stored in `docs/superpowers/plans/`.

## Rules

- Keep backend and frontend commands scoped to their own package directory.
- Treat Prisma schema and migrations as the source of truth for persisted data.
- Keep public catalog responses separate from staff only fields such as product stock.
- Use constructor injection for NestJS infrastructure and feature services.
- Use `@AllowAnonymous()` deliberately for public NestJS routes because authentication is global.
- Keep localized storefront routes and translation messages aligned across `en`, `ar`, `zh`, and `tr`.
- Do not expose environment values or credentials in source, logs, or documentation.

## Context files

- [backend/cormmerce/AGENTS.md](backend/cormmerce/AGENTS.md) Backend API, database, authentication, and admin conventions.
- [frontend/kmr/AGENTS.md](frontend/kmr/AGENTS.md) Storefront routes, UI, localization, and browser behavior.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite._
