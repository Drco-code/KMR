const { execSync } = require('child_process');

let dbUrl =
  process.env.MIGRATE_DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  '';

if (dbUrl.includes('neon.tech')) {
  // Strip the '-pooler' host segment to connect directly and allow PostgreSQL advisory locks
  dbUrl = dbUrl.replace(/-pooler\./g, '.');
}

console.log('[Prisma Migrations] Executing prisma migrate deploy with unpooled direct database connection...');

try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
      DIRECT_URL: dbUrl,
    },
  });
  console.log('[Prisma Migrations] All migrations deployed successfully.');
} catch (error) {
  console.error('[Prisma Migrations] Migration deploy failed:', error);
  process.exit(1);
}
