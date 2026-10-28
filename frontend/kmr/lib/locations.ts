// The physical shops, hardcoded on purpose: they change roughly never, and
// keeping them in one place means the footer and the contact page can't drift
// apart. Add/remove an entry here and both surfaces follow.
export interface ShopLocation {
  id: string;
  name: string;
  address: string;
  // What we hand the map provider — a place search rather than a pin, since
  // we don't store exact coordinates for the shops.
  mapsQuery: string;
}

export const SHOP_LOCATIONS: ShopLocation[] = [
  {
    id: "kojo-thompson-road",
    name: "Kojo Thompson Road",
    address: "Opposite Zenith Bank, Accra",
    mapsQuery: "Kojo Thompson Road, opposite Zenith Bank, Accra, Ghana",
  },
  {
    id: "kumasi-amakom",
    name: "Kumasi – Amakom",
    address: "Amakom, Kumasi",
    mapsQuery: "Amakom, Kumasi, Ghana",
  },
  {
    id: "spintex-manet-junction",
    name: "Spintex – Manet Junction",
    address: "Manet Junction, Spintex Road, Accra",
    mapsQuery: "Manet Junction, Spintex Road, Accra, Ghana",
  },
];

// The first entry is the shop the "open the map" fallback points at when no
// map is embedded on the site.
export const PRIMARY_LOCATION = SHOP_LOCATIONS[0];

// Tapping a location should open whichever map app the visitor already uses:
// Apple Maps on Apple devices, Google Maps everywhere else (its universal link
// opens the installed Google Maps app on Android and the web map on desktop).
export function mapsUrl(query: string, userAgent?: string | null): string {
  const encoded = encodeURIComponent(query);
  if (userAgent && /iPhone|iPad|iPod|Macintosh/i.test(userAgent)) {
    return `https://maps.apple.com/?q=${encoded}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}
