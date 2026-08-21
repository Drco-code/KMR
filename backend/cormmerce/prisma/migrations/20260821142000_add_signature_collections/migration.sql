-- CreateEnum
CREATE TYPE "SignatureCollectionType" AS ENUM ('EMULSION', 'OIL', 'POP', 'GRAFFIATE');

-- CreateTable
CREATE TABLE "SignatureCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "SignatureCollectionType" NOT NULL,
    "description" TEXT,
    "heroImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignatureCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignatureCollectionVariant" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "sizeLabel" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignatureCollectionVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignatureCollection_slug_key" ON "SignatureCollection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SignatureCollection_type_key" ON "SignatureCollection"("type");

-- CreateIndex
CREATE INDEX "SignatureCollectionVariant_collectionId_idx" ON "SignatureCollectionVariant"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SignatureCollectionVariant_collectionId_colorCode_sizeLabel_key" ON "SignatureCollectionVariant"("collectionId", "colorCode", "sizeLabel");

-- AddForeignKey
ALTER TABLE "SignatureCollectionVariant" ADD CONSTRAINT "SignatureCollectionVariant_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "SignatureCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed starter Signature Collections rows (admins can edit/remove/create later).
INSERT INTO "SignatureCollection" ("id", "name", "slug", "type", "description", "sortOrder", "updatedAt")
VALUES
    ('00000000-0000-4000-8000-00000000a001', 'KMR Emulsion Paint', 'kmr-emulsion-paint', 'EMULSION', 'Premium emulsion paint for smooth, durable interior finishes.', 1, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-00000000a002', 'KMR Oil Paint', 'kmr-oil-paint', 'OIL', 'High-performance oil-based paint built for rich color depth and durability.', 2, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-00000000a003', 'KMR POP Paint', 'kmr-pop-paint', 'POP', 'Bright white POP finish paint with multiple bucket sizes available.', 3, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-00000000a004', 'KMR Graffiate Paint', 'kmr-graffiate-paint', 'GRAFFIATE', 'Decorative graffiate coating for textured architectural surfaces.', 4, CURRENT_TIMESTAMP);
