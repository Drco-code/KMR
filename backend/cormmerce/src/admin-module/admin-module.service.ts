// AdminJS is ESM-only, so its packages are loaded via dynamic import()
// from this CommonJS-compiled file (see docs.adminjs.co/installation/plugins/nest).
//
// We don't use @adminjs/nestjs's built-in `auth`/`sessionOptions` option
// because that creates a SECOND, separate login session just for the
// dashboard. Instead this builds a plain Express middleware that checks
// the SAME Better Auth session cookie already used by the rest of the
// API (see auth-module/auth.ts) — one login, everywhere.
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import { auth } from '../auth-module/auth';
import { CloudinaryAdminUploadProvider } from '../cloudinary/cloudinary-admin-upload.provider';

// Mirrors src/admin-module/dashboard/types.ts. Not imported from there
// because that whole folder is excluded from this backend build (it's
// compiled separately, by AdminJS's own frontend bundler — see tsconfig.json).
interface DashboardData {
  stats: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    outOfStockProducts: number;
    featuredProducts: number;
  };
  topByQuantity: { productName: string; quantity: number }[];
  topByRequests: { productName: string; requests: number }[];
  trend: {
    products: string[];
    // Each row is { date: '2026-08-01', 'Planed Oak Timber 2x4': 12, ... }
    // — `Record<string, number | string>` rather than an intersection with
    // `{ date: string }`, since TS treats a plain-string 'date' property as
    // conflicting with a `Record<string, number>` index signature.
    days: Array<Record<string, number | string>>;
  };
}
// This is NOT the client the app queries with — it's a second,
// legacy-generator Prisma client generated purely so @adminjs/prisma can
// read model/field/enum metadata (Prisma.dmmf.datamodel), which the
// project's real `prisma-client` generator output doesn't expose. All
// actual reads/writes below still go through PrismaModuleService.
import * as adminJsMetadataClient from '../../generated/prisma-legacy';

const ADMIN_ROOT_PATH = '/admin';

const LOGIN_PAGE_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Admin sign in</title>
    <style>
      body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f4f5; }
      form { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); width: 280px; }
      h1 { font-size: 1.1rem; margin: 0 0 1rem; }
      label { display: block; font-size: 0.85rem; margin-bottom: 0.25rem; color: #333; }
      input { width: 100%; padding: 0.5rem; margin-bottom: 0.75rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
      button { width: 100%; padding: 0.6rem; border: none; border-radius: 4px; background: #111; color: #fff; cursor: pointer; }
      button:disabled { opacity: 0.6; cursor: default; }
      p.error { color: #b91c1c; font-size: 0.85rem; margin: 0 0 0.75rem; }
    </style>
  </head>
  <body>
    <form id="login-form">
      <h1>Staff sign in</h1>
      <p class="error" id="error" style="display:none"></p>
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required autocomplete="username" />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password" />
      <button type="submit">Sign in</button>
    </form>
    <script>
      const form = document.getElementById('login-form');
      const errorEl = document.getElementById('error');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorEl.style.display = 'none';
        const button = form.querySelector('button');
        button.disabled = true;
        try {
          const res = await fetch('/api/auth/sign-in/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: document.getElementById('email').value,
              password: document.getElementById('password').value,
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'Invalid email or password');
          }
          window.location.href = '${ADMIN_ROOT_PATH}';
        } catch (err) {
          errorEl.textContent = err.message || 'Sign in failed';
          errorEl.style.display = 'block';
          button.disabled = false;
        }
      });
    </script>
  </body>
</html>`;

@Injectable()
export class AdminModuleService {
  constructor(private readonly prisma: PrismaModuleService) {}

  // Backs the AdminJS custom dashboard (src/admin-module/dashboard/Dashboard.tsx).
  // "Demand" is derived from QuoteRequestItem.productName — a text snapshot,
  // not a Product FK (see schema.prisma comment on that field) — so it's
  // matched to products by exact name. Renamed products undercount their
  // pre-rename quotes; accepted as the best available signal since there's
  // no order/sales table, only quote requests.
  private async getDashboardData(): Promise<DashboardData> {
    const [totalProducts, activeProducts, outOfStockProducts, featuredProducts] =
      await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.product.count({ where: { stock: 0 } }),
        this.prisma.product.count({ where: { isFeatured: true } }),
      ]);

    const [quantityByProduct, requestsByProduct] = await Promise.all([
      this.prisma.quoteRequestItem.groupBy({
        by: ['productName'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      this.prisma.quoteRequestItem.groupBy({
        by: ['productName'],
        _count: { _all: true },
        orderBy: { _count: { productName: 'desc' } },
        take: 10,
      }),
    ]);

    // Top 5 by quantity feed the trend chart's lines.
    const topProductNames = quantityByProduct.slice(0, 5).map((p) => p.productName);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const trendItems = topProductNames.length
      ? await this.prisma.quoteRequestItem.findMany({
          where: {
            productName: { in: topProductNames },
            quoteRequest: { createdAt: { gte: cutoff } },
          },
          select: {
            productName: true,
            quantity: true,
            quoteRequest: { select: { createdAt: true } },
          },
        })
      : [];

    const dayKeys: string[] = [];
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayKeys.push(d.toISOString().slice(0, 10));
    }

    const dayIndex = new Map(dayKeys.map((date, index) => [date, index]));
    const days: Array<Record<string, number | string>> = dayKeys.map((date) => {
      const row: Record<string, number | string> = { date };
      for (const name of topProductNames) row[name] = 0;
      return row;
    });

    for (const item of trendItems) {
      const dayKey = item.quoteRequest.createdAt.toISOString().slice(0, 10);
      const index = dayIndex.get(dayKey);
      if (index === undefined) continue;
      const current = days[index][item.productName];
      days[index][item.productName] = (typeof current === 'number' ? current : 0) + item.quantity;
    }

    return {
      stats: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts,
        outOfStockProducts,
        featuredProducts,
      },
      topByQuantity: quantityByProduct.map((p) => ({
        productName: p.productName,
        quantity: p._sum.quantity ?? 0,
      })),
      topByRequests: requestsByProduct.map((p) => ({
        productName: p.productName,
        requests: p._count._all,
      })),
      trend: { products: topProductNames, days },
    };
  }

  // Builds the AdminJS instance itself, shared by both buildMiddleware()
  // (the running app, at request time) and prebundle() (a one-off script
  // run during deploy — see bundle-admin.ts). Keeping construction in one
  // place means the resources/dashboard/upload config below can't drift
  // between what the build-time bundler sees and what the running app serves.
  private async buildAdminInstance() {
    const [
      { default: AdminJS, ComponentLoader },
      { default: AdminJSExpress },
      { Database, Resource, getModelByName },
      { default: uploadFeature },
    ] = await Promise.all([
      import('adminjs'),
      import('@adminjs/express'),
      import('@adminjs/prisma'),
      import('@adminjs/upload'),
    ]);

    AdminJS.registerAdapter({ Database, Resource });

    const componentLoader = new ComponentLoader();
    const cloudinaryProvider = new CloudinaryAdminUploadProvider();
    const brandLogoProvider = new CloudinaryAdminUploadProvider('cormmerce/brands');

    // Custom dashboard replacing AdminJS's generic landing page — see
    // getDashboardData() above for the query logic and dashboard/Dashboard.tsx
    // for the rendering. componentLoader.add() points at the raw .tsx source
    // (copied verbatim into dist by the nest-cli "assets" entry, see
    // nest-cli.json), which AdminJS bundles with its own frontend webpack —
    // this file's own tsc compilation never touches it.
    const dashboardComponent = componentLoader.add(
      'Dashboard',
      path.join(__dirname, 'dashboard', 'Dashboard'),
    );

    // @adminjs/prisma only ever reads `clientModule.Prisma.dmmf.datamodel`
    // (see getModelByName/getEnums in its source) — it never touches the
    // rest of the generated client. We deliberately don't hand it the real
    // `adminJsMetadataClient` module: that module also exports Prisma 6's
    // enum namespaces (e.g. `Prisma.SortOrder`), which are wrapped in a
    // strict Proxy that throws on any unrecognized property access. AdminJS's
    // own constructor does a deep `lodash.merge` over the whole options
    // object (including this `clientModule`), and lodash's traversal probes
    // `.length` on every nested object — which the strict-enum Proxy treats
    // as an invalid enum member and throws on. This shim exposes only the
    // plain-data datamodel so that merge never reaches a guarded proxy.
    const dmmfShim = {
      Prisma: {
        dmmf: { datamodel: adminJsMetadataClient.Prisma.dmmf.datamodel },
      },
    };

    // Only the catalog/quote-request models — the Better Auth tables
    // (User/Session/Account/Verification) are deliberately excluded from
    // generic AdminJS CRUD.
    const modelNames = [
      'Category',
      'Product',
      'Brand',
      'QuoteRequest',
      'QuoteRequestItem',
    ];

    const admin = new AdminJS({
      rootPath: ADMIN_ROOT_PATH,
      componentLoader,
      branding: {
        companyName: 'KMR Admin',
        // Placeholder until there's a real KMR logo — `false` hides
        // AdminJS's default icon rather than showing generic branding.
        logo: false,
        // Hides the "Made with ♥ by AdminJS Team" footer credit.
        withMadeWithLove: false,
      },
      dashboard: {
        component: dashboardComponent,
        handler: async () => this.getDashboardData(),
      },
      resources: modelNames.map((name) => ({
        resource: {
          model: getModelByName(name, dmmfShim),
          client: this.prisma,
          clientModule: dmmfShim,
        },
        // The mimeType/filename/size sidecars exist purely so
        // @adminjs/upload's preview component doesn't crash (see schema
        // comment on Product.imagesMimeType) — staff never need to see or
        // edit them. `images` itself is populated by the file-upload widget
        // below, not typed in by hand, so it's hidden from the edit/new
        // forms but left visible on show/list for reference.
        options:
          name === 'Product'
            ? {
                properties: {
                  images: { isVisible: { list: true, show: true, edit: false, filter: false } },
                  imagesMimeType: { isVisible: false },
                  imagesFilename: { isVisible: false },
                  imagesSize: { isVisible: false },
                },
                // @adminjs/prisma misdetects Product.imagesSize (an Int[]
                // column) as a plain scalar number property, so the base
                // edit/new handlers — on any save, even ones that don't touch
                // images at all — submit a bare `0` for it instead of an
                // array, which Prisma then rejects. These sidecar fields are
                // only ever meant to be written by @adminjs/upload's own
                // after-hook (which computes them straight from the uploaded
                // file's real metadata, not from the submitted payload), so
                // stripping them from the payload here is always safe.
                actions: {
                  new: {
                    before: (request: any) => {
                      if (request.payload) {
                        delete request.payload.imagesMimeType;
                        delete request.payload.imagesFilename;
                        delete request.payload.imagesSize;
                      }
                      return request;
                    },
                  },
                  edit: {
                    before: (request: any) => {
                      if (request.payload) {
                        delete request.payload.imagesMimeType;
                        delete request.payload.imagesFilename;
                        delete request.payload.imagesSize;
                      }
                      return request;
                    },
                  },
                },
              }
            : name === 'Brand'
              ? {
                  // Same reasoning as Product's images sidecars above —
                  // logoMimeType/logoFilename/logoSize exist only so
                  // @adminjs/upload's preview component doesn't crash, and
                  // are only ever written by its own after-hook.
                  properties: {
                    logo: { isVisible: { list: true, show: true, edit: false, filter: false } },
                    logoMimeType: { isVisible: false },
                    logoFilename: { isVisible: false },
                    logoSize: { isVisible: false },
                  },
                  actions: {
                    new: {
                      before: (request: any) => {
                        if (request.payload) {
                          delete request.payload.logoMimeType;
                          delete request.payload.logoFilename;
                          delete request.payload.logoSize;
                        }
                        return request;
                      },
                    },
                    edit: {
                      before: (request: any) => {
                        if (request.payload) {
                          delete request.payload.logoMimeType;
                          delete request.payload.logoFilename;
                          delete request.payload.logoSize;
                        }
                        return request;
                      },
                    },
                  },
                }
              : {},
        // Lets staff pick one or more images straight from their PC/device
        // instead of pasting Cloudinary URLs by hand. See
        // CloudinaryAdminUploadProvider for how each uploaded file is mapped
        // onto an entry in Product.images (images[0] is the cover image).
        features:
          name === 'Product'
            ? [
                uploadFeature({
                  componentLoader,
                  provider: cloudinaryProvider,
                  multiple: true,
                  properties: {
                    key: 'images',
                    file: 'imageFiles',
                    mimeType: 'imagesMimeType',
                    filename: 'imagesFilename',
                    size: 'imagesSize',
                  },
                  uploadPath: (_record, filename) =>
                    cloudinaryProvider.buildUploadKey(filename),
                  validation: {
                    mimeTypes: [
                      'image/jpeg',
                      'image/png',
                      'image/webp',
                      'image/gif',
                    ],
                    maxSize: 8 * 1024 * 1024,
                  },
                }),
              ]
            : name === 'Brand'
              ? [
                  uploadFeature({
                    componentLoader,
                    provider: brandLogoProvider,
                    multiple: true,
                    properties: {
                      key: 'logo',
                      file: 'logoFiles',
                      mimeType: 'logoMimeType',
                      filename: 'logoFilename',
                      size: 'logoSize',
                    },
                    uploadPath: (_record, filename) =>
                      brandLogoProvider.buildUploadKey(filename),
                    validation: {
                      mimeTypes: [
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                        'image/gif',
                        'image/svg+xml',
                      ],
                      maxSize: 4 * 1024 * 1024,
                    },
                  }),
                ]
              : [],
      })),
    });

    return { admin, AdminJSExpress };
  }

  // Pre-builds the AdminJS frontend bundle (recharts + design-system +
  // dashboard components) to `.adminjs/bundle.js` on disk. Must run during
  // the Render BUILD step (see package.json's "bundle:admin" script and
  // bundle-admin.ts) — calling admin.initialize() at RUNTIME instead (i.e.
  // inside buildMiddleware, at app startup) ran webpack inside the live
  // app's 512MB instance and reliably OOM-killed it before the server could
  // even bind a port. @adminjs/express serves the bundle as a static file
  // by path, so it doesn't matter that this runs in a separate, throwaway
  // process from the one that later serves requests.
  async prebundle(): Promise<void> {
    const { admin } = await this.buildAdminInstance();
    await admin.initialize();
  }

  async buildMiddleware(): Promise<RequestHandler> {
    const { admin, AdminJSExpress } = await this.buildAdminInstance();

    // Dev only: watch() bundles once and keeps rebuilding on file changes.
    // In production the bundle already exists on disk from prebundle() —
    // see the comment above.
    if (process.env.NODE_ENV !== 'production') {
      await admin.watch();
    }

    const adminRouter = AdminJSExpress.buildRouter(admin);

    return async (req, res, next) => {
      if (req.method === 'GET' && req.path === '/login') {
        res.type('html').send(LOGIN_PAGE_HTML);
        return;
      }

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session) {
        res.redirect(`${ADMIN_ROOT_PATH}/login`);
        return;
      }

      adminRouter(req, res, next);
    };
  }
}
