const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

function toDirectDatabaseUrl(url) {
  if (!url) return url;
  if (url.includes('neon.tech')) {
    return url.replace(/-pooler\./g, '.');
  }
  return url;
}

async function run() {
  const rawUrl = process.env.MIGRATE_DATABASE_URL || process.env.DIRECT_URL || process.env.DATABASE_URL || '';
  if (!rawUrl) {
    console.log('[Migrations] No DATABASE_URL provided, skipping migration runner.');
    return;
  }

  const directUrl = toDirectDatabaseUrl(rawUrl);
  console.log('[Migrations] Connecting to PostgreSQL to verify and apply migrations...');

  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();

    // 1. Terminate any stale backends holding advisory locks & release advisory locks
    try {
      await client.query(`
        SELECT pg_terminate_backend(pid) 
        FROM pg_locks 
        WHERE locktype = 'advisory' AND pid <> pg_backend_pid();
      `);
      await client.query(`SELECT pg_advisory_unlock_all();`);
      console.log('[Migrations] Cleared stale postgres advisory locks.');
    } catch (err) {
      console.warn('[Migrations] Advisory lock cleanup warning:', err.message);
    }

    // 2. Ensure _prisma_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      );
    `);

    // 3. Scan prisma/migrations directory
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[Migrations] No migrations directory found.');
      return;
    }

    const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
    const migrationFolders = entries
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    console.log(`[Migrations] Found ${migrationFolders.length} migration folders.`);

    const { rows: appliedRows } = await client.query(`
      SELECT "migration_name" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL;
    `);
    const appliedSet = new Set(appliedRows.map((r) => r.migration_name));

    for (const name of migrationFolders) {
      if (appliedSet.has(name)) {
        continue;
      }

      const sqlFile = path.join(migrationsDir, name, 'migration.sql');
      if (!fs.existsSync(sqlFile)) {
        continue;
      }

      console.log(`[Migrations] Applying pending migration: ${name}...`);
      const sql = fs.readFileSync(sqlFile, 'utf8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');
      const migrationId = crypto.randomUUID();

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          `
          INSERT INTO "_prisma_migrations" 
          ("id", "checksum", "finished_at", "migration_name", "logs", "started_at", "applied_steps_count")
          VALUES ($1, $2, now(), $3, $4, now(), 1);
        `,
          [migrationId, checksum, name, '']
        );
        await client.query('COMMIT');
        console.log(`[Migrations] Successfully applied: ${name}`);
      } catch (migrationError) {
        await client.query('ROLLBACK');
        console.error(`[Migrations] Error applying migration ${name}:`, migrationError.message);
        throw migrationError;
      }
    }

    // Final unlock
    try {
      await client.query(`SELECT pg_advisory_unlock_all();`);
    } catch {}

    console.log('[Migrations] All database migrations are up to date.');
  } catch (error) {
    console.error('[Migrations] Migration execution failed:', error.message);
    // Don't crash postinstall if database is unreachable during local asset builds
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
      throw error;
    }
  } finally {
    await client.end().catch(() => {});
  }
}

run().catch((err) => {
  console.error('[Migrations] Unexpected error in run-migrations:', err);
});
