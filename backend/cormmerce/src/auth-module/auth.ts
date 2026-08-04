// This file sets up "Better Auth" — the library that handles staff login
// for the admin side of this app (customers never log in, only staff do).
//
// Better Auth needs to exist BEFORE Nest's dependency injection system
// starts up, so we can't use @Injectable()/constructor injection here like
// we normally would. This is the one place in the app where we create our
// own PrismaClient by hand instead of injecting PrismaModuleService.

// Load .env ourselves, right here at the top. This file reads
// process.env.DATABASE_URL below, and we can't rely on some OTHER file
// having loaded .env first — depending on import order like that is
// fragile (this exact bug caused sign-in to fail with a confusing
// "connection refused" error, because DATABASE_URL was still undefined
// when this file ran).
import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Better Auth talks to the same Postgres database as the rest of the app,
// through the same Prisma models (User, Session, Account) we already have
// in prisma/schema.prisma.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  // Better Auth's own base URL — must match the port this Nest app
  // actually listens on (see main.ts), not the frontend's port.
  baseURL: process.env.BETTER_AUTH_URL,

  // The frontend runs on a different origin, so it must be explicitly
  // trusted or Better Auth rejects its requests. FRONTEND_URL is the same
  // env var main.ts uses for CORS — set it to the real deployed frontend
  // URL in production, defaults to the local dev frontend otherwise.
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],

  // Tell Better Auth to store users/sessions/accounts in Postgres via Prisma.
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Our Prisma models are named User/Session/Account/Verification (capital
  // letter, standard Prisma style), but the actual property Prisma Client
  // gives us for each one is lowercase (prisma.user, prisma.session, etc).
  // These tell Better Auth which lowercase property name to call for each
  // model — without them, Better Auth guesses wrong and queries break.
  user: { modelName: 'user' },
  session: { modelName: 'session' },
  account: { modelName: 'account' },
  verification: { modelName: 'verification' },

  // Turn on "log in with email + password" (no Google/GitHub OAuth for now).
  emailAndPassword: {
    enabled: true,
  },

  // Rate limiting helps stop someone from guessing passwords by trying
  // thousands of logins in a row. This is on by default in production,
  // but we're being explicit about it here.
  rateLimit: {
    enabled: true,
  },

  // Hooks let us run our own code before/after Better Auth handles a
  // request. We use this to BLOCK the public sign-up endpoint, because
  // this is a staff-only admin panel — nobody should be able to create
  // their own account by just calling the API. Staff accounts get made
  // separately (see the seed script).
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // `ctx.request` only exists when this came in as a real HTTP request
      // (someone calling the API over the network). Our seed script calls
      // `auth.api.signUpEmail()` directly from server-side code, which has
      // no HTTP request attached — so it still works even though the
      // public route is blocked.
      if (ctx.path === '/sign-up/email' && ctx.request) {
        throw new APIError('FORBIDDEN', {
          message:
            'Public sign-up is disabled. Ask an admin to create your account.',
        });
      }
    }),
  },
});
