-- CreateTable
CREATE TABLE "PromoBanner" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoBanner_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton promo banner row (the storefront hides the bar while
-- the row is inactive or blank, so staff can pause it without deleting).
INSERT INTO "PromoBanner" ("id", "message", "isActive", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'Complimentary color consultation with any purchase over GH₵300',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
