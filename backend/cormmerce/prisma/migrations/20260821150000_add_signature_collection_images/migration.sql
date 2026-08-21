-- AlterTable
ALTER TABLE "SignatureCollection" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SignatureCollection" ADD COLUMN IF NOT EXISTS "imagesMimeType" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SignatureCollection" ADD COLUMN IF NOT EXISTS "imagesFilename" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SignatureCollection" ADD COLUMN IF NOT EXISTS "imagesSize" JSONB NOT NULL DEFAULT '[]'::jsonb;
