import { ProductCard } from "@/components/product-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import type { Category, Product } from "@/lib/api/types";

export function ProductGrid({
  products,
  categories,
  emptyMessage,
}: {
  products: Product[];
  categories?: Category[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="flex w-full items-center justify-center py-24 text-center">
        <p className="text-ink-muted">
          {emptyMessage ?? "No products found in this collection yet."}
        </p>
      </div>
    );
  }

  const categoryNameById = new Map(
    (categories ?? []).map((c) => [c.id, c.name])
  );

  return (
    <ScrollReveal
      className="grid w-full grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      stagger={0.08}
      y={24}
      duration={0.6}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryNameById.get(product.categoryId)}
        />
      ))}
    </ScrollReveal>
  );
}
