import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuoteCartItem {
  productId: string;
  name: string;
  slug: string;
  priceDescription: string | null;
  coverImage: string | null;
  quantity: number;
}

interface QuoteCartState {
  items: QuoteCartItem[];
  addItem: (item: Omit<QuoteCartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useQuoteCart = create<QuoteCartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "aura-hue-quote-cart" }
  )
);

export function useQuoteCartTotalItems() {
  return useQuoteCart((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
}
