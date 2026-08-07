import type { Brand, Category, Product, PromoBanner, QuoteRequestPayload } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${init?.method ?? "GET"} ${path} (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/category-module", { cache: "no-store" });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getProducts(): Promise<Product[]> {
  const products = await apiFetch<Product[]>("/product-module", { cache: "no-store" });
  return products.filter((product) => product.isActive);
}

export async function getProductsByCategorySlug(categorySlug: string): Promise<Product[]> {
  const [products, category] = await Promise.all([getProducts(), getCategoryBySlug(categorySlug)]);
  if (!category) return [];
  return products.filter((product) => product.categories.some((c) => c.id === category.id));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getBrands(): Promise<Brand[]> {
  const brands = await apiFetch<Brand[]>("/brand-module", { cache: "no-store" });
  return brands.filter((brand) => brand.isActive);
}

export async function getPromoBanner(): Promise<PromoBanner | null> {
  return apiFetch<PromoBanner | null>("/promo-module", { cache: "no-store" });
}

export async function submitQuoteRequest(payload: QuoteRequestPayload): Promise<void> {
  await apiFetch<unknown>("/quote-request-module", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
