# Category nav control + multi-category products (admin)

Date: 2026-08-05

## Problem

Staff need to control, from the admin dashboard:
1. Which categories appear in the storefront's dropdown/mega-menu, and in what order (currently every category with `parentId === null` shows up, unordered).
2. Which categories are nested under which (already partially possible via AdminJS's default `Category` CRUD, but the parent picker is a flat unlabeled dropdown).
3. Assignment of products to categories — and a product must be assignable to **more than one** category at once (currently `Product.categoryId` is a single required field).

Scope is bounded to the existing 3-tier mega-menu display (root nav item → column → column items) — the storefront's `mega-menu.tsx`/`mobile-nav.tsx` rendering depth is not being changed, only which categories populate it and in what order.

## Data model changes

### Category

Add two fields:

```prisma
model Category {
  // ...existing fields...
  showInNav Boolean @default(true)
  navOrder  Int     @default(0)
}
```

- `showInNav` gates whether a category is eligible to appear in the storefront dropdown at any tier. Categories can still exist and hold products (and be filtered on via the sidebar/catalog) without appearing in nav.
- `navOrder` controls sibling order within a tier. Default `0` for all existing rows; nav-building code sorts by `navOrder` ascending, then `createdAt` ascending as a tiebreaker, so existing categories retain their current (creation-order) relative position until staff explicitly reorders them.
- Both default such that pre-migration behavior is unchanged (`showInNav: true` for everything, stable order).

### Product ↔ Category

Replace the single required `Product.categoryId` / `Product.category` relation with an explicit many-to-many join model:

```prisma
model ProductCategory {
  id         String   @id @default(uuid())
  productId  String
  categoryId String
  isPrimary  Boolean  @default(false)

  product  Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  @@unique([productId, categoryId])
  @@index([categoryId])
  @@index([productId])
}
```

- `Product` gains `categories ProductCategory[]` (replacing `categoryId`/`category`).
- `Category` gains `products ProductCategory[]` (replacing the old direct `products Product[]`).
- `isPrimary` marks the one category (per product) that drives the canonical URL/breadcrumb. Exactly one `ProductCategory` row per product must have `isPrimary: true`.
- Enforcement: application-layer (service does the read-modify-write for a product's category set inside a single Prisma transaction, always ensuring exactly one `isPrimary: true`), backstopped by a Postgres partial unique index added via raw SQL in the migration:
  ```sql
  CREATE UNIQUE INDEX "ProductCategory_productId_primary_unique"
    ON "ProductCategory" ("productId")
    WHERE "isPrimary" = true;
  ```
- `onDelete: Restrict` on `category` preserves today's guarantee that a category can't be deleted while products reference it. `onDelete: Cascade` on `product` means deleting a product cleans up its join rows (new — previously deleting a product had no cascading join rows to clean since the relation was a plain FK).

### Migration steps (single Prisma migration)

1. Add `showInNav`, `navOrder` to `Category` (with defaults — no backfill needed).
2. Create `ProductCategory` table.
3. Data backfill: `INSERT INTO "ProductCategory" (id, "productId", "categoryId", "isPrimary") SELECT gen_random_uuid(), id, "categoryId", true FROM "Product"` (one primary row per existing product, preserving current assignment). `gen_random_uuid()` requires the `pgcrypto` extension on Postgres versions before 13; if the target DB doesn't already have it enabled, the migration adds `CREATE EXTENSION IF NOT EXISTS pgcrypto;` before this statement.
4. Add the partial unique index above.
5. Drop `Product.categoryId` column and its FK/index.

This is written as a `prisma migrate dev --create-only` migration, hand-edited to insert step 3 between the `ProductCategory` table creation and the `Product.categoryId` column drop.

## Backend changes

- **`category-module`**: DTOs (`create`/`update`) gain optional `showInNav?: boolean` and `navOrder?: number`. `findAll`/`findOne` are unaffected (Prisma returns all scalar fields automatically).
- **`product-module`**:
  - `CreateProductModuleDto`/`UpdateProductModuleDto`: replace `categoryId: string` with `categoryIds: string[]` (min length 1) and `primaryCategoryId: string` (must be included in `categoryIds`).
  - `create`/future `update` logic: validates all `categoryIds` exist, wraps the `Product` write plus `ProductCategory` row creation in a `$transaction`.
  - `findAll`/`findOne`: `include: { categories: { include: { category: true } } }` instead of `include: { category: true }`. Response shape maps each product's `categories` to `{ id, slug, name, isPrimary }[]` for the public API (still omitting `stock` as today).
- **Out of scope, left as-is**: `category-module.service.ts` and `product-module.service.ts` `update`/`remove` methods are pre-existing unwired stubs (return a placeholder string, never call Prisma). They're unrelated to this feature because all AdminJS writes go directly through `@adminjs/prisma` → the same `PrismaModuleService` client, bypassing these NestJS controllers entirely. Not fixing them here; flagged for awareness only.

## Admin UI (AdminJS) changes

All new components live in `backend/cormmerce/src/admin-module/dashboard/`, registered via `componentLoader.add(...)` in `admin-module.service.ts`, following the existing pattern set by `CategorySelect.tsx`.

### Category resource

- `showInNav` (boolean) and `navOrder` (number) become visible/editable properties on the list/edit/show views (default AdminJS rendering, just explicitly positioned in `admin-module.service.ts`'s `resources[...].options.properties`).
- New `CategoryParentSelect.tsx` property component replaces the default flat `parentId` reference input: breadcrumb-labeled options (`"Tools > Power Tool (A-M)"`, reusing the existing breadcrumb-building logic pattern from `CategorySelect.tsx`), excluding the record's own id and all of its descendants (computed client-side from the full flat category list) so a cycle can't be created.
- New **Category Tree** admin page (custom AdminJS page, alongside the existing `Dashboard.tsx` pattern): renders the full category hierarchy indented by depth. Each row shows name, a `showInNav` checkbox, and a `navOrder` number input — both editable inline, saving via `ApiClient.resourceAction({ actionName: 'edit', ... })` on change/blur — plus links into the normal AdminJS edit/show/delete actions for that record. Ordering is a typed number, not drag-and-drop (kept in scope deliberately; flagged to the user as the simpler option, approved).

### Product resource

- New `ProductCategoriesSelect.tsx` edit-property component replaces `CategorySelect.tsx`: a multi-select of breadcrumb-labeled categories, plus a way to mark exactly one selected category as primary (e.g. a radio button next to each checked option, disabled/hidden for unchecked ones). Backed by two virtual AdminJS properties (`categoryIds: string[]`, `primaryCategoryId: string`) that don't map 1:1 to a Prisma scalar column.
- Resource-level `actions.new`/`actions.edit` gain an `after` hook in `admin-module.service.ts` that reads those virtual params and syncs the `ProductCategory` rows for that product (delete-all-then-recreate inside a transaction, simplest correct approach given expected low category counts per product).
- New `ProductCategoriesList.tsx` show/list-only property renders the assigned categories as breadcrumb-labeled chips, with the primary one visually marked (e.g. bold or a small "Primary" badge).

## Storefront changes (`frontend/kmr`)

- `lib/api/types.ts`: `Category` gains `showInNav: boolean`, `navOrder: number`. `Product.categoryId`/`category` replaced with `categories: { id: string; slug: string; name: string; isPrimary: boolean }[]`.
- `lib/category-tree.ts`: `buildCategoryGroups`/`buildMegaMenuTree`/`findRootCategoryBySlug` filter to `showInNav === true` and sort by `navOrder` ascending (then `createdAt` ascending, then name as final tiebreaker) at every tier. Still exactly 3 tiers, unchanged rendering depth.
- `lib/catalog.ts`: `buildDescendantIdSets` is unchanged (still walks the full `Category` tree regardless of `showInNav`, since catalog filtering by a category the customer reached via URL/sidebar shouldn't depend on nav visibility). Product-matching logic changes from `treeIds.has(p.categoryId)` to `p.categories.some((c) => treeIds.has(c.id))`, in both `categoryCounts` and the `byCategory` filter.
- Product detail page / breadcrumb code: wherever the single `product.category` was read, switch to `product.categories.find((c) => c.isPrimary)`.
- `components/category-sidebar-filter.tsx`: unaffected — it filters by `Category` records directly, not through a product's category list, and intentionally shows the full catalog category set regardless of `showInNav` (nav visibility and catalog-filter visibility are different concerns; a category can be filterable without being in the dropdown).

## Testing / verification plan

- Backend: run the migration against the local Prisma Postgres dev DB; verify existing products retain their original category as `isPrimary: true` post-migration (spot check via a query).
- Manual HTTP verification (matching this project's existing verification style — see `memory.md`): `POST`/`GET` against `/product-module` and `/category-module` with the new fields, confirm shapes.
- AdminJS manual click-through: create a category, toggle `showInNav` off, confirm it disappears from the storefront's rendered mega-menu; set `navOrder` on siblings, confirm resulting order; assign a product to two categories with one marked primary, confirm both catalog listings show it and the product page breadcrumb uses the primary one.
- Frontend: run existing lint/typecheck; manually load the storefront dev server and browse the mega-menu, mobile nav, and catalog filtering to confirm no regressions for categories/products that weren't touched by the new fields.

## Explicitly out of scope

- Rendering more than 3 tiers in the storefront dropdown (data model already supports arbitrary depth; menu rendering does not, and isn't being changed).
- Drag-and-drop reordering in the admin Category Tree page (typed `navOrder` number instead).
- Fixing the pre-existing unwired `update`/`remove` stubs in `category-module.service.ts` / `product-module.service.ts`.
