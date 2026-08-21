import "dotenv/config";
import { execSync } from "child_process";
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
  process.env["DATABASE_URL"] = directDatabaseUrl;

  // Release any stale postgres advisory locks or idle connections left behind from aborted deploys
  try {
    const inlineScript = `
      const { Client } = require('pg');
      const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      client.connect()
        .then(() => client.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid() AND datname = current_database() AND state = 'idle';"))
        .then(() => client.query("SELECT pg_advisory_unlock_all();"))
        .then(() => client.end())
        .catch(() => process.exit(0));
    `;
    execSync(`node -e "${inlineScript.replace(/\n\s+/g, ' ')}"`, {
      env: { ...process.env, DATABASE_URL: directDatabaseUrl },
      stdio: 'ignore',
      timeout: 4000,
    });
  } catch {
    // Non-blocking cleanup
  }
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
