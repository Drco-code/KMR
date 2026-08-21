-- AlterTable
ALTER TABLE "SignatureCollection" ADD COLUMN IF NOT EXISTS "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SignatureCollection" ADD COLUMN IF NOT EXISTS "colors" JSONB NOT NULL DEFAULT '[]'::jsonb;

-- DropTable (CASCADE automatically removes foreign keys and constraints)
DROP TABLE IF EXISTS "SignatureCollectionVariant" CASCADE;

-- Update default sizes and colors for existing rows if empty
UPDATE "SignatureCollection"
SET "sizes" = ARRAY['1L', '4L', '20L', 'Drum']::TEXT[],
    "colors" = '[
      {"name":"Brilliant White","code":"#FFFFFF"},
      {"name":"Soft Alabaster","code":"#F2EBD9"},
      {"name":"Warm Cream","code":"#FDF6E2"},
      {"name":"Charcoal Grey","code":"#36454F"},
      {"name":"Slate Blue","code":"#6A5ACD"},
      {"name":"Sage Leaf","code":"#8A9A5B"},
      {"name":"Terracotta Clay","code":"#E2725B"},
      {"name":"Midnight Navy","code":"#002366"},
      {"name":"Golden Ochre","code":"#CC7722"},
      {"name":"Dusty Rose","code":"#DCAE96"},
      {"name":"Emerald Forest","code":"#2E8B57"},
      {"name":"Muted Sand","code":"#C2B280"}
    ]'::jsonb
WHERE "type" = 'EMULSION' AND ("sizes" = ARRAY[]::TEXT[] OR "sizes" IS NULL);

UPDATE "SignatureCollection"
SET "sizes" = ARRAY['0.5L', '1L', '4L', '20L']::TEXT[],
    "colors" = '[
      {"name":"Gloss White","code":"#FFFFFF"},
      {"name":"Jet Black","code":"#0A0A0A"},
      {"name":"Oxford Blue","code":"#002147"},
      {"name":"Signal Red","code":"#CC0000"},
      {"name":"British Racing Green","code":"#004225"},
      {"name":"Post Office Yellow","code":"#FFD700"},
      {"name":"Chocolate Brown","code":"#4B3621"},
      {"name":"Battleship Grey","code":"#848482"}
    ]'::jsonb
WHERE "type" = 'OIL' AND ("sizes" = ARRAY[]::TEXT[] OR "sizes" IS NULL);

UPDATE "SignatureCollection"
SET "sizes" = ARRAY['4L', '20L', '50kg Bag']::TEXT[],
    "colors" = '[
      {"name":"Pure Ceiling White","code":"#FFFFFF"},
      {"name":"Ultra Bright White","code":"#F8F9FA"}
    ]'::jsonb
WHERE "type" = 'POP' AND ("sizes" = ARRAY[]::TEXT[] OR "sizes" IS NULL);

UPDATE "SignatureCollection"
SET "sizes" = ARRAY['20L', '25kg Bucket', '30kg Bucket']::TEXT[],
    "colors" = '[
      {"name":"Travertine Beige","code":"#E3DAC9"},
      {"name":"Limestone Grey","code":"#C4C4BC"},
      {"name":"Warm Terracotta","code":"#CB6D51"},
      {"name":"Desert Sand","code":"#EDC9AF"},
      {"name":"Sahara White","code":"#FDFBF7"},
      {"name":"Granite Charcoal","code":"#4A4E51"},
      {"name":"Tuscan Sun","code":"#E4A010"},
      {"name":"Olive Grove","code":"#6B7152"}
    ]'::jsonb
WHERE "type" = 'GRAFFIATE' AND ("sizes" = ARRAY[]::TEXT[] OR "sizes" IS NULL);
