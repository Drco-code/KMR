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
  isActive: boolean;
  isFeatured: boolean;
  categories: ProductCategoryRef[];
  createdAt: string;
  // Aggregated from quote-request history — see resolveCatalog's
  // "best-selling" sort. A proxy for popularity, not confirmed sales.
  totalQuantityRequested: number;
}

export interface Brand {
  id: string;
  name: string;
  websiteUrl: string | null;
  isActive: boolean;
  logo: string[];
}

// The active promo banner for the header bar, as served by GET /promo-module.
// The backend always returns an object — a null message means no promo is
// running and the bar hides (a bare null would serialize to an empty body).
export interface PromoBanner {
  message: string | null;
  link: string | null;
}

export interface QuoteRequestItem {
  productName: string;
  quantity: number;
}

export interface QuoteRequestPayload {
  customerName: string;
  customerCompany?: string;
  customerPhone?: string;
  items: QuoteRequestItem[];
}
