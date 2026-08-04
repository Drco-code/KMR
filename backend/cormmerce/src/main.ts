import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminModuleService } from './admin-module/admin-module.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Required for Better Auth
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Mounted directly on the underlying Express app (not as a Nest
  // controller) because AdminJS's router needs to own everything under
  // /admin itself. See admin-module.service.ts for the session check.
  const adminMiddleware = await app.get(AdminModuleService).buildMiddleware();
  app.use('/admin', adminMiddleware);

  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
