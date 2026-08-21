import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations use MIGRATE_DATABASE_URL when set, otherwise a direct
// unpooled connection derived from DATABASE_URL.
//
// The production database is Neon, and its pooled URL (the "-pooler"
// host segment) routes through PgBouncer which cannot hold session-level
// Postgres advisory locks (SELECT pg_advisory_lock).
// Neon's direct URL is identical except the "-pooler." host segment is removed.
function toDirectDatabaseUrl(url: string): string {
  if (!url) return url;
  if (url.includes('neon.tech')) {
    return url.replace(/-pooler\./g, '.');
  }
  return url;
}

const rawUrl = process.env["DATABASE_URL"] ?? '';
const directDatabaseUrl =
  process.env["MIGRATE_DATABASE_URL"] ??
  process.env["DIRECT_URL"] ??
  toDirectDatabaseUrl(rawUrl);

if (directDatabaseUrl) {
  // Overwrite process.env.DATABASE_URL so schema.prisma's env("DATABASE_URL")
  // connects directly to Neon without going through the advisory-lock blocking pooler.
  process.env["DATABASE_URL"] = directDatabaseUrl;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: directDatabaseUrl || rawUrl,
  },
});
