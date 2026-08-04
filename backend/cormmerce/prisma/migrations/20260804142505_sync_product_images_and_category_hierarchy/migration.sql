-- This migration captures schema drift that existed only on the local dev
-- database (applied there via `prisma db push`, never as a tracked
-- migration) — Category.parentId and its self-referential hierarchy, plus
-- Product's move from a single imageUrl column to the images[]/stock
-- columns the app has actually been using. Both tables are empty on every
-- environment except local dev, so the column drop is safe.

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "imagesFilename" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "imagesMimeType" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "imagesSize" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
