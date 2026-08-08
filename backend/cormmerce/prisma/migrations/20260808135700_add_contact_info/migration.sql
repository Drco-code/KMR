-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "address" TEXT,
    "mapEmbedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton contact/location row with placeholder values — staff
-- edit it from the AdminJS dashboard (new/delete are hidden for this
-- resource). The map URL is an OpenStreetMap embed of Accra; swap in a
-- Google Maps "Embed a map" src to use Google instead.
INSERT INTO "ContactInfo" ("id", "address", "mapEmbedUrl", "updatedAt")
VALUES (
    '00000000-0000-4000-8000-00000000c001',
    '123 Sample Street, Accra, Ghana',
    'https://www.openstreetmap.org/export/embed.html?bbox=-0.2200%2C5.5837%2C-0.1400%2C5.6237&layer=mapnik&marker=5.6037%2C-0.1870',
    CURRENT_TIMESTAMP
);
