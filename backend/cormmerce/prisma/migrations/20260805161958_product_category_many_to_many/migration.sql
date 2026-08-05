-- Ensure gen_random_uuid() is available (built into Postgres 13+ core;
-- this is a no-op on servers where it's already present).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_productId_categoryId_key" ON "ProductCategory"("productId", "categoryId");

-- CreateIndex
CREATE INDEX "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");

-- CreateIndex
CREATE INDEX "ProductCategory_productId_idx" ON "ProductCategory"("productId");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DataMigration: preserve every existing Product's current category as its primary category
INSERT INTO "ProductCategory" ("id", "productId", "categoryId", "isPrimary")
SELECT gen_random_uuid(), "id", "categoryId", true FROM "Product";

-- Enforce exactly one primary category per product at the DB level (application layer also enforces this in ProductModuleService)
CREATE UNIQUE INDEX "ProductCategory_productId_primary_unique" ON "ProductCategory"("productId") WHERE "isPrimary" = true;

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryId";
