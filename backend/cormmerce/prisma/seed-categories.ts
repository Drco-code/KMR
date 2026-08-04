// Seeds the 3-level category tree that powers the topbar mega menu:
// nav item (Tools, Outdoor Equipment, ...) -> column header -> leaf item.
//
// Run with: npx tsx prisma/seed-categories.ts
// Safe to re-run: category names are unique, so existing rows are reused
// (upsert-by-name) rather than duplicated.

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
}

const TREE: TreeNode[] = [
  {
    name: 'Tools',
    children: [
      {
        name: 'Power Tool (A - M)',
        children: [
          { name: 'Bench & Stationary Tool' },
          { name: 'Blowers' },
          { name: 'Circular Saws' },
          { name: 'Demolition Hammers' },
          { name: 'Drills' },
          { name: 'Grinders' },
          { name: 'Glue Guns' },
          { name: 'Heat Guns' },
          { name: 'Impact Wrench & Drivers' },
          { name: 'Jigsaws' },
          { name: 'Marble & Tile Cutters' },
          { name: 'Mixers' },
        ],
      },
      {
        name: 'Power Tool (N - Z)',
        children: [
          { name: 'Nailers & Staplers' },
          { name: 'Planer & Joiners' },
          { name: 'Power Tool Combo Kits' },
          { name: 'Powered Screwdrivers' },
          { name: 'Reciprocating Saws' },
          { name: 'Rotary & Oscillating Tools' },
          { name: 'Routers' },
          { name: 'Sanders' },
          { name: 'Specialty Power Tool' },
          { name: 'Spray Guns' },
          { name: 'Wall Chasers' },
        ],
      },
      {
        name: 'Power Tool Accessories',
        children: [
          { name: 'Batteries & Chargers' },
          { name: 'Chuck, Keys & Specialty Accessories' },
          { name: 'Drill Bits' },
          { name: 'Grinding & Cutting Wheels' },
          { name: 'Hole Saws & Cores' },
          { name: 'Oscillating Tool Accessories' },
          { name: 'Router Bits' },
          { name: 'Saw Blades' },
          { name: 'Screwdriver Bits' },
          { name: 'Wire Wheels & Brushes' },
        ],
      },
      {
        name: 'Hand Tool',
        children: [
          { name: 'Caulking Gun' },
          { name: 'Chisels, Files, Planes & Punches' },
          { name: 'Hammers, Mallets & Sledges' },
          { name: 'Hand Saws & Cutting Tools' },
          { name: 'Multi Tools & Knives' },
          { name: 'Pliers' },
          { name: 'Screwdrivers' },
          { name: 'Sockets & Hex Keys' },
          { name: 'Staplers, Riveters & Fasteners' },
          { name: 'Vices & Clamps' },
          { name: 'Wrenches' },
        ],
      },
      {
        name: 'Tool Sets & Tool Storage',
        children: [
          { name: 'Tool Boxes, Bags & Belts' },
          { name: 'Tool Chests & Cabinets' },
          { name: 'Tool Set' },
        ],
      },
      {
        name: 'Measuring, Marking, Levels & Hanging Tools',
        children: [
          { name: 'Digital Meters' },
          { name: 'Hanging Tools' },
          { name: 'Laser Measures' },
          { name: 'Levels' },
          { name: 'Marking, Squares & Caliper' },
          { name: 'Measuring Scales' },
          { name: 'Tape Measures' },
        ],
      },
    ],
  },
  {
    name: 'Outdoor Equipment',
    children: [
      {
        name: 'Lawn & Garden Power Equipment',
        children: [
          { name: 'Lawn Mowers' },
          { name: 'Trimmers & Edgers' },
          { name: 'Leaf Blowers & Vacuums' },
          { name: 'Chainsaws' },
          { name: 'Hedge Trimmers' },
          { name: 'Tillers & Cultivators' },
        ],
      },
      {
        name: 'Outdoor Power Accessories',
        children: [
          { name: 'Chains & Bars' },
          { name: 'Trimmer Line & Blades' },
          { name: 'Batteries & Chargers' },
          { name: 'Filters & Spark Plugs' },
        ],
      },
      {
        name: 'Watering & Irrigation',
        children: [
          { name: 'Hoses & Reels' },
          { name: 'Sprinklers' },
          { name: 'Irrigation Fittings' },
          { name: 'Watering Cans' },
        ],
      },
      {
        name: 'Outdoor Living',
        children: [
          { name: 'Grills & Accessories' },
          { name: 'Patio Heaters' },
          { name: 'Outdoor Storage' },
          { name: 'Fire Pits' },
        ],
      },
      {
        name: 'Garden Tools & Hand Equipment',
        children: [
          { name: 'Shovels & Spades' },
          { name: 'Rakes & Hoes' },
          { name: 'Pruners & Shears' },
          { name: 'Wheelbarrows' },
        ],
      },
    ],
  },
  {
    name: 'Building Materials',
    children: [
      {
        name: 'Lumber & Panels',
        children: [
          { name: 'Dimensional Lumber' },
          { name: 'Plywood & OSB' },
          { name: 'Molding & Trim' },
          { name: 'Engineered Wood' },
        ],
      },
      {
        name: 'Concrete, Cement & Masonry',
        children: [
          { name: 'Ready-Mix Concrete' },
          { name: 'Cement & Mortar' },
          { name: 'Bricks & Blocks' },
          { name: 'Rebar & Mesh' },
        ],
      },
      {
        name: 'Roofing & Siding',
        children: [
          { name: 'Shingles & Underlayment' },
          { name: 'Metal Roofing' },
          { name: 'Siding Panels' },
          { name: 'Gutters & Downspouts' },
        ],
      },
      {
        name: 'Drywall & Insulation',
        children: [
          { name: 'Drywall Sheets' },
          { name: 'Joint Compound & Tape' },
          { name: 'Insulation Batts & Rolls' },
          { name: 'Vapor Barriers' },
        ],
      },
      {
        name: 'Doors, Windows & Hardware',
        children: [
          { name: 'Interior Doors' },
          { name: 'Exterior Doors' },
          { name: 'Windows' },
          { name: 'Door & Window Hardware' },
        ],
      },
    ],
  },
  {
    name: 'Home Essentials',
    children: [
      {
        name: 'Plumbing',
        children: [
          { name: 'Pipes & Fittings' },
          { name: 'Faucets & Fixtures' },
          { name: 'Water Heaters' },
          { name: 'Drain & Sewer' },
        ],
      },
      {
        name: 'Electrical',
        children: [
          { name: 'Wiring & Cable' },
          { name: 'Switches & Outlets' },
          { name: 'Circuit Breakers & Panels' },
          { name: 'Lighting Fixtures' },
        ],
      },
      {
        name: 'Paint & Finishing',
        children: [
          { name: 'Interior Paint' },
          { name: 'Exterior Paint' },
          { name: 'Primers & Sealers' },
          { name: 'Brushes, Rollers & Sprayers' },
        ],
      },
      {
        name: 'Hardware & Fasteners',
        children: [
          { name: 'Screws & Bolts' },
          { name: 'Nails & Anchors' },
          { name: 'Hinges & Latches' },
          { name: 'Cabinet Hardware' },
        ],
      },
      {
        name: 'Home Safety & Security',
        children: [
          { name: 'Smoke & CO Detectors' },
          { name: 'Locks & Deadbolts' },
          { name: 'Fire Extinguishers' },
          { name: 'Security Cameras' },
        ],
      },
    ],
  },
  {
    name: 'Auto Essentials',
    children: [
      {
        name: 'Auto Maintenance',
        children: [
          { name: 'Motor Oil & Fluids' },
          { name: 'Filters' },
          { name: 'Batteries & Chargers' },
          { name: 'Belts & Hoses' },
        ],
      },
      {
        name: 'Tools & Diagnostics',
        children: [
          { name: 'Automotive Tools' },
          { name: 'Diagnostic Scanners' },
          { name: 'Jacks & Stands' },
          { name: 'Creepers' },
        ],
      },
      {
        name: 'Tires & Wheels',
        children: [
          { name: 'Tire Accessories' },
          { name: 'Wheel Care' },
          { name: 'Tire Repair Kits' },
          { name: 'Pressure Gauges' },
        ],
      },
      {
        name: 'Car Care',
        children: [
          { name: 'Wash & Wax' },
          { name: 'Interior Cleaners' },
          { name: 'Polish & Wax' },
          { name: 'Microfiber & Applicators' },
        ],
      },
      {
        name: 'Auto Accessories',
        children: [
          { name: 'Floor Mats & Liners' },
          { name: 'Seat Covers' },
          { name: 'Cargo Organizers' },
          { name: 'Roof Racks & Carriers' },
        ],
      },
    ],
  },
];

async function upsertCategory(name: string, parentId: string | null) {
  const slug = slugify(name);
  return prisma.category.upsert({
    where: { name },
    update: { parentId },
    create: { name, slug, parentId },
  });
}

async function seedNode(node: TreeNode, parentId: string | null) {
  const category = await upsertCategory(node.name, parentId);
  console.log(`${parentId ? '  ' : ''}${node.name}`);
  for (const child of node.children ?? []) {
    await seedNode(child, category.id);
  }
}

async function main() {
  for (const root of TREE) {
    await seedNode(root, null);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
