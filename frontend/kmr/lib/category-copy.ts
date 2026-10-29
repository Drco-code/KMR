// Real, shopper-useful copy for the top-level catalog categories. Written from
// what the catalog actually contains (product and brand names in the live
// data), not from marketing claims. Any category without its own entry falls
// back to a factual one-liner built from its name.
//
// TODO: replace/extend these with descriptions written by the team for the
// subcategories you care about most — see SETUP.md.
const CATEGORY_COPY: Record<string, string> = {
  tools: "Power tools, hand tools and workshop accessories for professionals and home projects — drills, saws, grinders, planers, measuring and marking tools, fasteners, tool sets and storage from brands including Bosch, Wadfow, Ingco, Freud and NRG Tools.",
  "outdoor-equipment":
    "Outdoor and site equipment for gardens, yards and job sites in Ghana — lawn mowers, hedge trimmers, leaf blowers and vacuums, chainsaws, pruners, rakes, shovels, wheelbarrows, generators and water pumps.",
  "building-materials":
    "Building materials and finishing supplies for construction and renovation — timber, boards and playwood, interior and exterior doors, plumbing pipes and fittings, wiring and cable, circuit breakers, adhesives, sealants, primers and paint.",
  "home-essentials":
    "Home essentials and finishing touches — lighting and light profiles, faucets and fixtures, cabinet and door hardware, kitchen accessories, water heaters, and home safety and security equipment such as smoke detectors and cameras.",
  "home-safety-security":
    "Smoke and carbon monoxide detectors, security cameras and everyday home safety equipment from KMR City Ventures, available from our Accra and Kumasi shops.",
};

export function categoryDescription(slug: string, name: string): string {
  return (
    CATEGORY_COPY[slug] ??
    `${name} from KMR City Ventures, supplied from our shops in Accra and Kumasi. Browse the range below, then request a quote for pricing, bulk rates and delivery anywhere in Ghana.`
  );
}
