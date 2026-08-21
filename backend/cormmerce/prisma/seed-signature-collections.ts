import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SIGNATURE_COLLECTIONS = [
  {
    type: 'EMULSION' as const,
    name: 'KMR Emulsion Paint',
    slug: 'kmr-emulsion-paint',
    description:
      'Premium water-based interior & exterior wall coating with ultra-matte velvet finish, high scrub resistance, and superior opacity.',
    heroImage: '/images/optimized/signature-1.webp',
    sortOrder: 1,
    sizes: ['1L', '4L', '20L', 'Drum'],
    colors: [
      { name: 'Brilliant White', code: '#FFFFFF' },
      { name: 'Soft Alabaster', code: '#F2EBD9' },
      { name: 'Warm Cream', code: '#FDF6E2' },
      { name: 'Charcoal Grey', code: '#36454F' },
      { name: 'Slate Blue', code: '#6A5ACD' },
      { name: 'Sage Leaf', code: '#8A9A5B' },
      { name: 'Terracotta Clay', code: '#E2725B' },
      { name: 'Midnight Navy', code: '#002366' },
      { name: 'Golden Ochre', code: '#CC7722' },
      { name: 'Dusty Rose', code: '#DCAE96' },
      { name: 'Emerald Forest', code: '#2E8B57' },
      { name: 'Muted Sand', code: '#C2B280' },
    ],
  },
  {
    type: 'OIL' as const,
    name: 'KMR Oil Paint',
    slug: 'kmr-oil-paint',
    description:
      'High-gloss solvent-based enamel engineered for maximum weather durability, metal protection, and rich woodwork luster.',
    heroImage: '/images/optimized/signature-2.webp',
    sortOrder: 2,
    sizes: ['0.5L', '1L', '4L', '20L'],
    colors: [
      { name: 'Gloss White', code: '#FFFFFF' },
      { name: 'Jet Black', code: '#0A0A0A' },
      { name: 'Oxford Blue', code: '#002147' },
      { name: 'Signal Red', code: '#CC0000' },
      { name: 'British Racing Green', code: '#004225' },
      { name: 'Post Office Yellow', code: '#FFD700' },
      { name: 'Chocolate Brown', code: '#4B3621' },
      { name: 'Battleship Grey', code: '#848482' },
    ],
  },
  {
    type: 'POP' as const,
    name: 'KMR POP Paint',
    slug: 'kmr-pop-paint',
    description:
      'Specialized ultra-bright white ceiling and Plaster of Paris coating formulated for seamless ceiling application and zero glare.',
    heroImage: '/images/optimized/signature-3.webp',
    sortOrder: 3,
    sizes: ['4L', '20L', '50kg Bag'],
    colors: [
      { name: 'Pure Ceiling White', code: '#FFFFFF' },
      { name: 'Ultra Bright White', code: '#F8F9FA' },
    ],
  },
  {
    type: 'GRAFFIATE' as const,
    name: 'KMR Graffiate Paint',
    slug: 'kmr-graffiate-paint',
    description:
      'Heavy-duty textured architectural acrylic plaster providing superior crack-bridging, algae protection, and luxury exterior stucco finishes.',
    heroImage: '/images/optimized/signature-4.webp',
    sortOrder: 4,
    sizes: ['20L', '25kg Bucket', '30kg Bucket'],
    colors: [
      { name: 'Travertine Beige', code: '#E3DAC9' },
      { name: 'Limestone Grey', code: '#C4C4BC' },
      { name: 'Warm Terracotta', code: '#CB6D51' },
      { name: 'Desert Sand', code: '#EDC9AF' },
      { name: 'Sahara White', code: '#FDFBF7' },
      { name: 'Granite Charcoal', code: '#4A4E51' },
      { name: 'Tuscan Sun', code: '#E4A010' },
      { name: 'Olive Grove', code: '#6B7152' },
    ],
  },
];

async function main() {
  console.log('Seeding / updating 4 Signature Collections with direct sizes and colors...');

  for (const item of SIGNATURE_COLLECTIONS) {
    const upserted = await prisma.signatureCollection.upsert({
      where: { type: item.type },
      create: {
        type: item.type,
        name: item.name,
        slug: item.slug,
        description: item.description,
        heroImage: item.heroImage,
        sortOrder: item.sortOrder,
        sizes: item.sizes,
        colors: item.colors,
        isActive: true,
      },
      update: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        heroImage: item.heroImage,
        sortOrder: item.sortOrder,
        sizes: item.sizes,
        colors: item.colors,
        isActive: true,
      },
    });

    console.log(`✓ Upserted ${upserted.name} (${item.sizes.length} sizes, ${item.colors.length} colors)`);
  }

  console.log('Done!');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
