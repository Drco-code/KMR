// Run during the deploy BUILD step (see package.json "bundle:admin" and the
// Render build command), never at runtime. Pre-builds the AdminJS frontend
// bundle to `.adminjs/bundle.js` on disk so the running app can just serve
// it as a static file — see AdminModuleService.prebundle() for why doing
// this webpack build inside the live app's process OOM-killed it on
// Render's memory-constrained instance.
//
// Constructs PrismaModuleService directly instead of going through Nest's
// DI/module bootstrap — bundling never queries the database, it only reads
// the Prisma DMMF for resource metadata (already true of the real app too,
// see admin-module.service.ts's dmmfShim comment), so a full Nest app
// isn't needed here.
import 'dotenv/config';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import { AdminModuleService } from './admin-module.service';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// AdminJS defaults this to the dot-directory `.adminjs`. Render's
// build-to-runtime artifact packaging silently drops dot-directories, so
// the bundle this script produces during the BUILD step never survived
// into the running instance — every AdminJS asset request (custom
// dashboard, image upload widgets) 404'd at runtime even though the build
// logs showed bundling succeed. main.ts must set this identically, since
// both processes need to agree on where the bundle lives.
process.env.ADMIN_JS_TMP_DIR = process.env.ADMIN_JS_TMP_DIR || 'adminjs-bundle';

async function main() {
  const prisma = new PrismaModuleService();
  const adminModuleService = new AdminModuleService(prisma);
  await adminModuleService.prebundle();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
