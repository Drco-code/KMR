-- The map was seeded (see 20260808135700_add_contact_info) with a placeholder
-- OpenStreetMap view of Accra rather than any actual shop, so the footer's
-- embedded map dropped visitors on a random street. Point it at the primary
-- KMR shop instead: Kojo Thompson Road, opposite Zenith Bank.
--
-- Google Maps' keyless "output=embed" form is used on purpose — it needs no
-- API key, and the API only forwards http(s) srcs to the iframe
-- (contact-info-module.service.ts). The guard keeps a real, staff-supplied
-- embed if one was set in the admin dashboard in the meantime.
UPDATE "ContactInfo"
SET "mapEmbedUrl" = 'https://maps.google.com/maps?q=Kojo+Thompson+Road%2C+opposite+Zenith+Bank%2C+Accra%2C+Ghana&z=16&output=embed',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "mapEmbedUrl" IS NULL
   OR "mapEmbedUrl" LIKE '%openstreetmap.org%';
