import type {
  Brand,
  Category,
  ContactInfo,
  Product,
  PromoBanner,
  QuoteRequestPayload,
  SignatureCollection,
} from "./types";
import { categorySlug, productSlug } from "@/lib/slug";

const rawApiUrl =
  process.env.KMR_API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_URL = rawApiUrl?.replace(/\/+$/, "");

if (!API_URL) {
  throw new Error(
    "KMR_API_URL is required. Set it to the server-side NestJS API origin before building or serving the storefront. NEXT_PUBLIC_API_URL is only read as a legacy fallback."
  );
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    throw new Error(
      `API request failed: ${init?.method ?? "GET"} ${new URL(path, API_URL).toString()} (${res.status})`
    );
  }

  return res.json() as Promise<T>;
}

export async function getCategories(): Promise<Category[]> {
  const categories = await apiFetch<Category[]>("/category-module", { cache: "no-store" });
  return categories.map((category) => ({
    ...category,
    slug: categorySlug(category.slug || category.name),
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  const requestedSlug = categorySlug(decodeURIComponent(slug));
  return categories.find((category) => category.slug === requestedSlug) ?? null;
}

export async function getProducts(): Promise<Product[]> {
  const products = await apiFetch<Product[]>("/product-module", { cache: "no-store" });
  return products
    .filter((product) => product.isActive)
    .map((product) => ({
      ...product,
      slug: productSlug(product.slug || product.name),
      categories: product.categories.map((category) => ({
        ...category,
        slug: categorySlug(category.slug || category.name),
      })),
    }))
    .filter((product) => product.slug.length > 0);
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<Product[]> {
  const [products, category] = await Promise.all([getProducts(), getCategoryBySlug(categorySlug)]);
  if (!category) return [];
  return products.filter((product) => product.categories.some((c) => c.id === category.id));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  const requestedSlug = productSlug(decodeURIComponent(slug));
  return products.find((product) => product.slug === requestedSlug) ?? null;
}

export async function getBrands(): Promise<Brand[]> {
  const brands = await apiFetch<Brand[]>("/brand-module", { cache: "no-store" });
  return brands.filter((brand) => brand.isActive);
}

export async function getPromoBanner(): Promise<PromoBanner> {
  return apiFetch<PromoBanner>("/promo-module", { cache: "no-store" });
}

export async function getContactInfo(): Promise<ContactInfo> {
  return apiFetch<ContactInfo>("/contact-info-module", { cache: "no-store" });
}

export async function submitQuoteRequest(payload: QuoteRequestPayload): Promise<void> {
  await apiFetch<unknown>("/quote-request-module", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSignatureCollections(): Promise<SignatureCollection[]> {
  return apiFetch<SignatureCollection[]>("/signature-collection-module", { cache: "no-store" });
}

export async function getSignatureCollectionBySlug(
  slug: string
): Promise<SignatureCollection | null> {
  try {
    const decodedSlug = decodeURIComponent(slug);
    return await apiFetch<SignatureCollection>(
      `/signature-collection-module/${encodeURIComponent(decodedSlug)}`,
      { cache: "no-store" }
    );
  } catch {
    return null;
  }
}
