// AdminJS is ESM-only, so its packages are loaded via dynamic import()
// from this CommonJS-compiled file (see docs.adminjs.co/installation/plugins/nest).
//
// We don't use @adminjs/nestjs's built-in `auth`/`sessionOptions` option
// because that creates a SECOND, separate login session just for the
// dashboard. Instead this builds a plain Express middleware that checks
// the SAME Better Auth session cookie already used by the rest of the
// API (see auth-module/auth.ts) — one login, everywhere.
import { BadRequestException, Injectable } from '@nestjs/common';
import * as path from 'path';
import { readFile } from 'fs/promises';
import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import * as QRCode from 'qrcode';
import { PrismaModuleService } from '../prisma-module/prisma-module.service';
import { auth } from '../auth-module/auth';
import { CloudinaryAdminUploadProvider } from '../cloudinary/cloudinary-admin-upload.provider';
import { slugify } from '../product-module/slug';
import { normalizeYouTubeUrl } from '../product-module/youtube';

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

// Matches the Product.youtubeUrls key and any flattened `youtubeUrls.N`
// index keys AdminJS's form may submit (see normalizeProductYouTubeUrls).
const YOUTUBE_URLS_KEY = /^youtubeUrls(?:\.\d+)?$/;

function isYouTubeUrlsKey(key: string): boolean {
  return YOUTUBE_URLS_KEY.test(key);
}

// Orders flattened keys by numeric index so `youtubeUrls.10` sorts after
// `youtubeUrls.2` regardless of the order they arrive in; the bare
// `youtubeUrls` key (which can hold a whole array) sorts first.
function compareYouTubeUrlsKeys(a: string, b: string): number {
  const indexOf = (key: string) =>
    key === 'youtubeUrls' ? -1 : Number(key.slice('youtubeUrls.'.length));
  return indexOf(a) - indexOf(b);
}

// Product.youtubeUrls is a String[] column, but @adminjs/prisma misdetects
// every array column as a plain string property (its Property class never
// overrides isArray — see Property.js in that package). The old single text
// input therefore round-tripped a multi-video array as its JSON string,
// e.g. '["url1","url2"]'. Before normalizing, try to parse that shape back
// into a list; anything that isn't a JSON array of strings is treated as one
// plain URL and validated by normalizeYouTubeUrl.
function parseJsonStringArray(value: string): string[] | null {
  if (!/^\s*\[/.test(value)) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
  } catch {
    // not JSON — fall through to single-URL handling
  }
  return null;
}

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

  private normalizeProductSlug(payload: Record<string, unknown>) {
    const source = typeof payload.slug === 'string' && payload.slug.trim()
      ? payload.slug
      : payload.name;

    if (typeof source !== 'string') return;

    const slug = slugify(source);
    if (!slug) {
      throw new Error('Product slug must contain at least one letter or number');
    }

    payload.slug = slug;
  }

  // @adminjs/prisma's Property class never overrides isArray(), so every
  // String[] column is misdetected as a plain string property (same class of
  // adapter bug as imagesSize — see the schema.prisma comment there).
  // Product.youtubeUrls is the first array column actually exposed to the
  // AdminJS edit form, so the base new/edit handler submits its value as a
  // bare string, which Prisma rejects — youtubeUrls must be a String[]. This
  // collapses every shape the form can submit (bare string, JSON-stringified
  // list from the old text input, or youtubeUrls.N flattened keys from the
  // array editor) into a real array, before the adapter's prepareParams
  // passes the value through untouched to prisma.product.update().
  private normalizeProductYouTubeUrls(
    payload: Record<string, unknown>,
    originalParams?: Record<string, unknown>,
  ) {
    const keys = Object.keys(payload)
      .filter(isYouTubeUrlsKey)
      .sort(compareYouTubeUrlsKeys);

    // The array editor submits nothing at all once every input is removed,
    // which is indistinguishable from "field not touched" — except when the
    // record being edited actually had videos. In that case the admin
    // deliberately cleared them all, so write an empty array instead of
    // silently keeping the old videos on save.
    if (keys.length === 0) {
      const hadVideos = Object.keys(originalParams ?? {}).some(isYouTubeUrlsKey);
      if (hadVideos) payload.youtubeUrls = [];
      return;
    }

    const collected: unknown[] = [];
    for (const key of keys) {
      const value = payload[key];
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) collected.push(...value);
      else collected.push(value);
    }

    const rawValues =
      collected.length === 1 && typeof collected[0] === 'string'
        ? parseJsonStringArray(collected[0]) ?? collected
        : collected;

    const urls: string[] = [];
    for (const value of rawValues) {
      if (typeof value !== 'string') {
        throw new BadRequestException('Each video must be a YouTube URL');
      }
      // The array editor leaves blank rows behind whenever the admin removes
      // an input — drop them rather than failing validation on every save.
      if (!value.trim()) continue;
      urls.push(normalizeYouTubeUrl(value));
    }

    payload.youtubeUrls = urls;
    for (const key of keys) {
      if (key !== 'youtubeUrls') delete payload[key];
    }
  }

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

  // Reads the categoryIds/primaryCategoryId virtual fields submitted by
  // ProductCategoriesSelect.tsx and replaces this product's ProductCategory
  // rows to match. Runs after AdminJS's own new/edit action has already
  // created/updated the Product row itself.
  private async syncProductCategories(productId: string | undefined, payload: any) {
    if (!productId || !payload || typeof payload.categoryIds !== 'string') return;

    const categoryIds = payload.categoryIds.split(',').filter(Boolean);
    const primaryCategoryId = categoryIds.includes(payload.primaryCategoryId)
      ? payload.primaryCategoryId
      : categoryIds[0];
    if (categoryIds.length === 0) return;

    // Only persist category ids that actually exist — a stale id in the
    // submitted form (e.g. a category deleted after the form loaded) would
    // otherwise make the createMany below fail the whole save with a
    // foreign-key error and show a generic "error" on every product edit.
    const existing = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((c) => c.id));
    const validIds = categoryIds.filter((categoryId: string) => existingIds.has(categoryId));
    if (validIds.length === 0) return;

    await this.prisma.$transaction([
      this.prisma.productCategory.deleteMany({ where: { productId } }),
      this.prisma.productCategory.createMany({
        data: validIds.map((categoryId: string) => ({
          productId,
          categoryId,
          isPrimary: categoryId === primaryCategoryId && validIds.includes(primaryCategoryId),
        })),
      }),
    ]);
  }

  // The read-path counterpart to syncProductCategories above. @adminjs/prisma
  // never includes reverse relations (ProductCategory has no scalar FK on
  // Product) and AdminJS's own populator only resolves to-one `reference`
  // properties, so nothing in the base show/list/edit handlers ever loads a
  // product's assigned categories — without this, the Show page always says
  // "No categories assigned" and the Edit form always starts with zero
  // categories checked, which is actively dangerous given syncProductCategories
  // does a full delete+recreate: an admin editing a product they can't see the
  // existing categories for would silently wipe them on save. Queried in bulk
  // (IN productIds) so the list action stays a single extra query, not N+1.
  private async getProductCategoriesMap(
    productIds: string[],
  ): Promise<Map<string, { id: string; name: string; isPrimary: boolean }[]>> {
    const map = new Map<string, { id: string; name: string; isPrimary: boolean }[]>();
    if (productIds.length === 0) return map;

    const rows = await this.prisma.productCategory.findMany({
      where: { productId: { in: productIds } },
      include: { category: true },
      orderBy: [{ isPrimary: 'desc' }],
    });

    for (const row of rows) {
      // Guard against orphaned rows (a productCategory whose category was
      // deleted before the FK Restrict constraint existed). The join would
      // otherwise throw on row.category.id and 500 every product edit on
      // databases with legacy data.
      if (!row.category) continue;
      const list = map.get(row.productId) ?? [];
      list.push({ id: row.category.id, name: row.category.name, isPrimary: row.isPrimary });
      map.set(row.productId, list);
    }
    return map;
  }

  // Stamps the categories/categoryIds/primaryCategoryId params AdminJS's
  // response `RecordJSON` needs onto an already-serialized record (i.e. after
  // `.toJSON()` has run — see show/list/edit action sources in
  // node_modules/adminjs, which build the response's `record`/`records` this
  // way before any `after` hook sees it). Plain object mutation is sufficient;
  // there's no live BaseRecord left to re-serialize at this point.
  private applyProductCategoryParams(
    params: Record<string, any>,
    categories: { id: string; name: string; isPrimary: boolean }[],
  ) {
    params.categories = categories;
    const categoryIds = categories.map((c) => c.id);
    params.categoryIds = categoryIds.join(',');
    params.primaryCategoryId = categories.find((c) => c.isPrimary)?.id ?? categoryIds[0] ?? '';
  }

  // Backs the "Category Tree" custom admin page — returns every category
  // flat (id/name/parentId/showInNav/navOrder), which the page itself
  // arranges into an indented tree client-side.
  private async getCategoryTreeData() {
    return this.prisma.category.findMany({
      select: { id: true, name: true, parentId: true, showInNav: true, navOrder: true },
      orderBy: [{ navOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  // Backs the "Global Search" custom admin page (dashboard/GlobalSearch.tsx).
  // With 150+ categories and growing catalogs, finding a record by scrolling
  // list pages gets slow — this searches the meaningful text fields of every
  // catalog/quote model at once (case-insensitive contains) and returns up to
  // 8 matches per model so the page can link straight to each record.
  // AdminJS 7.x has no built-in global search (only per-resource filters and
  // the hidden autocomplete `search` action), so this custom page fills that
  // gap using the same `pages` mechanism as the Category Tree page.
  private async searchData(request: any) {
    const query = (request?.query?.q ?? '').toString().trim();
    if (!query) {
      return { query: '', results: {}, total: 0 };
    }

    const contains = { contains: query, mode: 'insensitive' as const };
    const take = 8;

    const [products, categories, brands, promos, quoteRequests, items] =
      await Promise.all([
        this.prisma.product.findMany({
          where: {
            OR: [
              { name: contains },
              { slug: contains },
              { description: contains },
              { priceDescription: contains },
            ],
          },
          take,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, slug: true, isActive: true, isFeatured: true },
        }),
        this.prisma.category.findMany({
          where: { OR: [{ name: contains }, { slug: contains }] },
          take,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, slug: true, showInNav: true },
        }),
        this.prisma.brand.findMany({
          where: { OR: [{ name: contains }, { websiteUrl: contains }] },
          take,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, websiteUrl: true, isActive: true },
        }),
        this.prisma.promoBanner.findMany({
          where: { OR: [{ message: contains }, { link: contains }] },
          take,
          orderBy: { updatedAt: 'desc' },
          select: { id: true, message: true, link: true, isActive: true },
        }),
        this.prisma.quoteRequest.findMany({
          where: {
            OR: [
              { customerName: contains },
              { customerCompany: contains },
              { customerPhone: contains },
              { customerLocation: contains },
            ],
          },
          take,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            customerName: true,
            customerCompany: true,
            customerPhone: true,
            customerLocation: true,
            status: true,
            createdAt: true,
          },
        }),
        this.prisma.quoteRequestItem.findMany({
          where: { OR: [{ productName: contains }] },
          take,
          orderBy: { quantity: 'desc' },
          select: { id: true, productName: true, quantity: true, quoteRequestId: true },
        }),
      ]);

    const results = {
      Product: products,
      Category: categories,
      Brand: brands,
      PromoBanner: promos,
      QuoteRequest: quoteRequests,
      QuoteRequestItem: items,
    };

    return {
      query,
      results,
      total: Object.values(results).reduce((sum, rows) => sum + rows.length, 0),
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

    const categoryParentSelectComponent = componentLoader.add(
      'CategoryParentSelect',
      path.join(__dirname, 'dashboard', 'CategoryParentSelect'),
    );

    const categoryTreeComponent = componentLoader.add(
      'CategoryTree',
      path.join(__dirname, 'dashboard', 'CategoryTree'),
    );

    const globalSearchComponent = componentLoader.add(
      'GlobalSearch',
      path.join(__dirname, 'dashboard', 'GlobalSearch'),
    );

    const productCategoriesSelectComponent = componentLoader.add(
      'ProductCategoriesSelect',
      path.join(__dirname, 'dashboard', 'ProductCategoriesSelect'),
    );
    const productCategoriesListComponent = componentLoader.add(
      'ProductCategoriesList',
      path.join(__dirname, 'dashboard', 'ProductCategoriesList'),
    );
    const productQrCodeComponent = componentLoader.add(
      'ProductQrCode',
      path.join(__dirname, 'dashboard', 'ProductQrCode'),
    );

    // AdminJS's built-in logout button only renders when it manages its own
    // session (buildAuthenticatedRouter); this app shares Better Auth's
    // session cookie instead (see buildMiddleware() below), so the default
    // sidebar never shows one. Override it with a working "Sign out" button
    // — see SidebarFooter.tsx for the full explanation.
    componentLoader.override(
      'SidebarFooter',
      path.join(__dirname, 'dashboard', 'SidebarFooter'),
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
      'PromoBanner',
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
      pages: {
        categoryTree: {
          component: categoryTreeComponent,
          handler: async () => this.getCategoryTreeData(),
        },
        globalSearch: {
          component: globalSearchComponent,
          handler: (request: any) => this.searchData(request),
        },
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
                  youtubeUrls: {
                    // isArray makes AdminJS render a proper add/remove URL list
                    // (the description promises "one or more" links, but the
                    // adapter misdetecting the String[] column as a plain
                    // string otherwise leaves only a single text input). The
                    // filter is hidden because the adapter's convertFilter
                    // emits `{ contains }` on the array column, which Prisma
                    // rejects — filtering products by video URL would 500.
                    isArray: true,
                    isVisible: { list: true, show: true, edit: true, filter: false },
                    description: 'Add one or more YouTube links. Videos appear after images on the product page.',
                  },
                  // AdminJS's built-in rich text editor (TipTap-based —
                  // bold/italic/headings/lists/links/blockquotes) stores its
                  // output as an HTML string straight into this same
                  // Product.description column. The storefront sanitizes it
                  // with sanitize-html before rendering (see
                  // app/product/[slug]/page.tsx) — this column now holds
                  // staff-authored markup, not plain text.
                  description: { type: 'richtext' },
                  categories: {
                    isVisible: { list: false, show: true, edit: false, filter: false },
                    components: { show: productCategoriesListComponent },
                  },
                  categoryIds: {
                    type: 'string',
                    isVisible: { list: false, show: false, edit: true, filter: false },
                    components: { edit: productCategoriesSelectComponent },
                  },
                  primaryCategoryId: {
                    type: 'string',
                    isVisible: false,
                  },
                  // Virtual property — not a real DB column. The QR is
                  // generated on-demand by buildMiddleware()'s
                  // /api/products/:id/qr-code route from FRONTEND_URL +
                  // slug, so there's nothing to store or edit here.
                  qrCode: {
                    isVisible: { list: false, show: true, edit: false, filter: false },
                    components: { show: productQrCodeComponent },
                  },
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
                        this.normalizeProductSlug(request.payload);
                        this.normalizeProductYouTubeUrls(request.payload);
                        delete request.payload.imagesMimeType;
                        delete request.payload.imagesFilename;
                        delete request.payload.imagesSize;
                      }
                      return request;
                    },
                    after: async (response: any, request: any) => {
                      await this.syncProductCategories(response.record?.params?.id, request.payload);
                      return response;
                    },
                  },
                  // GET (render) and POST (save) both flow through this same
                  // `after` hook. On GET, request.payload is empty so
                  // syncProductCategories's own guard no-ops the write side —
                  // we only need the read side below. On POST, sync runs first
                  // (write), then the read side re-fetches, so the response
                  // reflects the just-saved state rather than stale pre-save
                  // params. Doing it this way (always re-fetch after an
                  // unconditional sync attempt) avoids needing to branch on
                  // request.method here at all.
                  edit: {
                    before: (request: any, context: any) => {
                      if (request.payload) {
                        this.normalizeProductSlug(request.payload);
                        // originalParams lets the hook distinguish "field not
                        // touched" from "all videos removed" (see
                        // normalizeProductYouTubeUrls) so clearing every URL
                        // actually persists.
                        this.normalizeProductYouTubeUrls(
                          request.payload,
                          context?.record?.params,
                        );
                        delete request.payload.imagesMimeType;
                        delete request.payload.imagesFilename;
                        delete request.payload.imagesSize;
                      }
                      return request;
                    },
                    after: async (response: any, request: any) => {
                      const productId = response.record?.params?.id;
                      await this.syncProductCategories(productId, request.payload);
                      if (productId) {
                        const map = await this.getProductCategoriesMap([productId]);
                        this.applyProductCategoryParams(response.record.params, map.get(productId) ?? []);
                      }
                      return response;
                    },
                  },
                  show: {
                    after: async (response: any) => {
                      const productId = response.record?.params?.id;
                      if (productId) {
                        const map = await this.getProductCategoriesMap([productId]);
                        this.applyProductCategoryParams(response.record.params, map.get(productId) ?? []);
                      }
                      return response;
                    },
                  },
                  list: {
                    after: async (response: any) => {
                      const records = response.records ?? [];
                      const productIds = records
                        .map((record: any) => record.params?.id)
                        .filter((id: unknown): id is string => typeof id === 'string');
                      const map = await this.getProductCategoriesMap(productIds);
                      for (const record of records) {
                        this.applyProductCategoryParams(record.params, map.get(record.params?.id) ?? []);
                      }
                      return response;
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
              : name === 'Category'
                ? {
                    properties: {
                      parentId: { components: { edit: categoryParentSelectComponent } },
                    },
                  }
                : name === 'PromoBanner'
                  ? {
                      properties: {
                        // Promo copy can be long — textarea beats a single-line input.
                        message: { type: 'textarea' },
                      },
                      actions: {
                        // Exactly one promo banner row exists (seeded by the
                        // migration) — staff edit it, they don't create or
                        // delete it. Hiding new/delete keeps it a singleton.
                        new: { isVisible: false },
                        delete: { isVisible: false },
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

    // @adminjs/express's own static-asset route (buildAssets in that
    // package) serves AdminJS's pre-built scripts — global.bundle.js,
    // design-system.bundle.js, app.bundle.js (everything AdminJS ships in
    // its own package rather than bundling itself here) — via Express's
    // res.sendFile(). On this project's current Node version, sendFile
    // throws a false "Not Found" for those exact files even though they
    // demonstrably exist on disk (reproduced in total isolation with a
    // bare Express server, no AdminJS/Nest/app code involved at all) —
    // apparently a `send`-package/Node-version incompatibility. Reading
    // and serving the same files ourselves, ahead of adminRouter, sidesteps
    // the broken sendFile call entirely. Built from AdminJS's own
    // `Router.assets` list (path -> src) rather than hardcoded paths, so
    // this stays correct if that list ever changes. Does NOT cover
    // components.bundle.js — in dev that one is served by a live
    // "bundleComponents" action route, not this static list, and it
    // already works fine.
    const { Router: adminAssetRouter } = await import('adminjs');
    const staticAssetsByPath = new Map(
      adminAssetRouter.assets.map((asset) => [asset.path, path.resolve(asset.src)]),
    );

    return async (req, res, next) => {
      if (req.method === 'GET' && req.path === '/login') {
        res.type('html').send(LOGIN_PAGE_HTML);
        return;
      }

      const staticAssetPath = staticAssetsByPath.get(req.path);
      if (req.method === 'GET' && staticAssetPath) {
        try {
          const content = await readFile(staticAssetPath);
          res.type(path.extname(staticAssetPath)).send(content);
        } catch {
          res.status(404).end();
        }
        return;
      }

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session) {
        res.redirect(`${ADMIN_ROOT_PATH}/login`);
        return;
      }

      // Check for inactivity timeout (1 hour)
      // If the session has been inactive for more than 1 hour, the user is logged out.
      // This ensures that abandoned admin sessions are automatically invalidated.
      const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour in milliseconds
      const sessionRecord = await this.prisma.session.findUnique({
        where: { id: session.session.id },
        select: { lastActivityAt: true },
      });

      if (sessionRecord?.lastActivityAt) {
        const lastActivity = new Date(sessionRecord.lastActivityAt);
        const now = new Date();
        const timeSinceLastActivity = now.getTime() - lastActivity.getTime();

        if (timeSinceLastActivity > INACTIVITY_TIMEOUT_MS) {
          // Session has been inactive for more than 1 hour, invalidate it
          await this.prisma.session.delete({
            where: { id: session.session.id },
          });
          res.redirect(`${ADMIN_ROOT_PATH}/login`);
          return;
        }
      }

      // Update lastActivityAt to current time
      await this.prisma.session.update({
        where: { id: session.session.id },
        data: { lastActivityAt: new Date() },
      });

      // Generates the product-label QR on demand from FRONTEND_URL + slug —
      // deliberately not stored anywhere (no DB column, no Cloudinary
      // upload) so it can never go stale if the slug changes, and costs
      // nothing beyond this one request. Handled here, ahead of adminRouter,
      // since it's a plain PNG response rather than an AdminJS JSON action.
      const qrCodeMatch = req.path.match(/^\/api\/products\/([^/]+)\/qr-code$/);
      if (req.method === 'GET' && qrCodeMatch) {
        const product = await this.prisma.product.findUnique({
          where: { id: qrCodeMatch[1] },
          select: { slug: true },
        });
        if (!product) {
          res.status(404).end();
          return;
        }
        const productUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/product/${product.slug}`;
        const png = await QRCode.toBuffer(productUrl, { type: 'png', width: 360 });
        res.set('Content-Disposition', `attachment; filename="${product.slug}-qr.png"`);
        res.type('png').send(png);
        return;
      }

      adminRouter(req, res, next);
    };
  }
}
