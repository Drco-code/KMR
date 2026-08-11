export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  showInNav: boolean;
  navOrder: number;
}

export interface ProductCategoryRef {
  id: string;
  slug: string;
  name: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceDescription: string | null;
  images: string[];
  youtubeUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  categories: ProductCategoryRef[];
  createdAt: string;
  // Aggregated from quote-request history, see resolveCatalog's
  // "best-selling" sort. A proxy for popularity, not confirmed sales.
  totalQuantityRequested: number;
}

export interface Brand {
  id: string;
  name: string;
  websiteUrl: string | null;
  // One-line tagline shown under the brand name in the homepage "Our
  // Brands" section.
  description: string | null;
  isActive: boolean;
  logo: string[];
}

// The active promo banner for the header bar, as served by GET /promo-module.
// The backend always returns an object, a null message means no promo is
// running and the bar hides (a bare null would serialize to an empty body).
export interface PromoBanner {
  message: string | null;
  link: string | null;
}

// The singleton contact/location row served by GET /contact-info-module,
// powering the footer's "Visit Us" block (address + mini map). Null fields
// mean "not set" and the footer hides the matching part.
export interface ContactInfo {
  address: string | null;
  mapEmbedUrl: string | null;
}

export interface QuoteRequestItem {
  productName: string;
  quantity: number;
}

export interface QuoteRequestPayload {
  customerName: string;
  customerCompany?: string;
  customerPhone?: string;
  customerLocation?: string;
  items: QuoteRequestItem[];
}
