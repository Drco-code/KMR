import { ArcjetGuard, ArcjetModule, fixedWindow, shield } from '@arcjet/nest';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
// AuthModule + our `auth` config wire up staff login for the admin API.
// By default it protects EVERY route — public routes must opt out with
// the @AllowAnonymous() decorator (see category/product/quote-request controllers).
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth-module/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma-module/prisma-module.module';
import { CategoryModuleModule } from './category-module/category-module.module';
import { ProductModuleModule } from './product-module/product-module.module';
import { BrandModuleModule } from './brand-module/brand-module.module';
import { QuoteRequestModuleModule } from './quote-request-module/quote-request-module.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ClodinaryService } from './clodinary/clodinary.service';
import { AdminModuleModule } from './admin-module/admin-module.module';

import 'dotenv/config';

const arcjetMode = process.env.ARCJET_MODE === 'LIVE' ? 'LIVE' : 'DRY_RUN';

@Module({
  imports: [
    ArcjetModule.forRoot({
      isGlobal: true,
      key: process.env.ARCJET_KEY!,
      rules: [
        shield({ mode: arcjetMode }),
        fixedWindow({
          mode: arcjetMode,
          window: '10s',
          max: 10,
        }),
      ],
    }),
    PrismaModule,
    // .forRoot() hands Better Auth our config and gives us login/logout/
    // session routes under /api/auth/*, plus a global login-required guard.
    AuthModule.forRoot({ auth }),
    CategoryModuleModule,
    ProductModuleModule,
    BrandModuleModule,
    QuoteRequestModuleModule,
    CloudinaryModule,
    AdminModuleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ClodinaryService,
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
export class AppModule {}
