import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminModuleService } from './admin-module/admin-module.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  // FRONTEND_URL is the storefront's origin (e.g. https://cormmerce.vercel.app
  // in production, http://localhost:3000 in dev). Without this, the browser
  // blocks every cross-origin API call the frontend makes — same underlying
  // issue as the Better Auth trustedOrigins check in auth-module/auth.ts,
  // but this is Nest's own CORS layer, which gates the public catalog API
  // (product-module, category-module, etc.), not just Better Auth's routes.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // @adminjs/express's buildRouter() unconditionally calls admin.initialize()
  // internally on its own (fire-and-forget, not awaited by buildRouter) —
  // it does this EVERY time a router is built, regardless of whether we
  // already pre-built the bundle ourselves. In production that reruns the
  // full webpack build (recharts + design-system) inside this running
  // app's process, which is what was OOM-killing it a couple minutes after
  // boot even after moving our OWN admin.initialize() call to the build
  // step (see AdminModuleService.prebundle / bundle-admin.ts). AdminJS
  // checks this exact env var and no-ops instead — the pre-built bundle
  // from the build step is still served fine as a static file either way.
  process.env.ADMIN_JS_SKIP_BUNDLE = 'true';

  // Must match bundle-admin.ts's ADMIN_JS_TMP_DIR exactly — see the
  // comment there for why it's not the `.adminjs` default (Render's
  // build-to-runtime packaging drops dot-directories).
  process.env.ADMIN_JS_TMP_DIR = process.env.ADMIN_JS_TMP_DIR || 'adminjs-bundle';

  // Mounted directly on the underlying Express app (not as a Nest
  // controller) because AdminJS's router needs to own everything under
  // /admin itself. See admin-module.service.ts for the session check.
  const adminMiddleware = await app.get(AdminModuleService).buildMiddleware();
  app.use('/admin', adminMiddleware);

  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
