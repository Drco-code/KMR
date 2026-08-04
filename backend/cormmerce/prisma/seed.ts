// This script creates the FIRST staff account, so someone can actually log
// in to the admin panel. It's a one-time bootstrap step — after this, staff
// accounts should be created by an already-logged-in admin, not by this script.
//
// We can't sign up over the internet (we disabled that on purpose — see
// src/auth-module/auth.ts), so instead this script talks to Better Auth
// directly, from the server side, to create the account.
//
// Run it with: npx tsx prisma/seed.ts
// (or: npx prisma db seed, which uses the same command via prisma.config.ts)

import 'dotenv/config';
import { auth } from '../src/auth-module/auth';

async function main() {
  // Read the new admin's details from environment variables, instead of
  // hard-coding a password in the source code (that would be a security risk).
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? 'Admin';

  if (!email || !password) {
    console.error(
      'Missing SEED_ADMIN_EMAIL and/or SEED_ADMIN_PASSWORD in your .env file.\n' +
        'Add both, then run this script again.',
    );
    process.exit(1);
  }

  // This is the same function Better Auth uses internally for sign-up —
  // it hashes the password properly and creates the User + Account rows.
  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  });

  console.log(`Created staff account for ${result.user.email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create staff account:', error);
    process.exit(1);
  });
