# Hakcathon Backend

## Role

You are a senior NestJS developer. Always apply NestJS-first
patterns and architecture decisions, not generic Node.js approaches.

## Code standards

- Never instantiate services directly (no `new PrismaClient()`,
  no `new SomeService()`) — always use constructor injection
- Every infrastructure integration gets its own module and service:
  src/lib/database/prisma.module.ts + prisma.service.ts
  src/lib/mail/mail.module.ts + mail.service.ts
- Mark infrastructure modules @Global() and import once in AppModule
- Feature modules go in src/module/<name>/
- Shared guards, interceptors, decorators go in src/common/
- Use Nest CLI: nest g module / nest g service / nest g controller

## Skills

Do not load any skill by default. Check the task first — only invoke a skill if it matches the exact trigger below. Never invoke a skill just because it exists.

- `/architect` — before building something non-trivial with no plan yet
- `/review` — when a feature is done and needs a production check
- `/recover` — when something is broken and the fix isn't obvious
- `/remember` — at the start of a new session to restore context,
  and at the end to save progress.

## Session continuity

REQUIRED — do not skip, do not wait to be asked:

- **First action of every session:** run `/remember restore` before doing anything else.
- **Last action of every session:** run `/remember save` before closing.

## Overview

This package is the NestJS API. It serves the public catalog and quote endpoints, staff authentication, the AdminJS dashboard, Cloudinary uploads, and database access through Prisma.

## Key files

| File | Owns |
|---|---|
| `src/main.ts` | Nest bootstrap, CORS, validation, AdminJS mounting, and port |
| `src/app.module.ts` | Global guards and feature module composition |
| `src/prisma-module/` | Prisma client lifecycle and database access |
| `src/auth-module/auth.ts` | Better Auth configuration and staff email login |
| `src/admin-module/` | AdminJS dashboard, uploads, and admin specific behavior |
| `prisma/schema.prisma` | PostgreSQL data model |
| `prisma/migrations/` | Applied database changes |
| `prisma/seed.ts` | Seed data and staff setup |

## Commands

Run from this directory.

```bash
npm install
npm run start:dev
npm run build
npm run test
npm run test:e2e
```

## Conventions and gotchas

- The global Better Auth guard protects routes by default. Public catalog and quote routes must use `@AllowAnonymous()`.
- `ValidationPipe` uses whitelist, forbids unknown fields, and enables implicit conversion.
- `DATABASE_URL` is used by Prisma runtime, while migrations can use `MIGRATE_DATABASE_URL` or `DIRECT_URL` to avoid pooled Neon advisory lock issues.
- The generated Prisma client is in `generated/prisma`; the legacy generated client exists only for AdminJS metadata.
- AdminJS is mounted directly on Express under `/admin`, not through a Nest controller. Production uses a prebuilt bundle in `adminjs-bundle`.
- Cloudinary stores product and collection media. PostgreSQL stores the resulting URLs and aligned upload metadata arrays.
- Public product reads omit internal `stock` and return flattened category references.
- Product category membership is many to many, with one primary category used for canonical storefront navigation.

_Migrated by /audit from the former CLAUDE.md and expanded from the repo, worth a quick human pass._
