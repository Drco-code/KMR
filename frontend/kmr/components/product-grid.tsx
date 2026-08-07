import { ProductCard } from "@/components/product-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import type { Product } from "@/lib/api/types";

export function ProductGrid({
  products,
  emptyMessage,
}: {
  products: Product[];
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

  return (
    <ScrollReveal
      className="flex w-full flex-wrap justify-center gap-6"
      stagger={0.08}
      y={24}
      duration={0.6}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={product.categories.find((c) => c.isPrimary)?.name}
        />
      ))}
    </ScrollReveal>
  );
}
