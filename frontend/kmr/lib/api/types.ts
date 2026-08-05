export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
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
  categoryId: string;
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
