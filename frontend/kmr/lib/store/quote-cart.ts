import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuoteCartItem {
  itemKey: string;
  productId: string;
  name: string;
  slug: string;
  href?: string;
  priceDescription: string | null;
  coverImage: string | null;
  variantColorName?: string;
  variantColorCode?: string;
  variantSize?: string;
  quantity: number;
}

interface QuoteCartState {
  items: QuoteCartItem[];
  addItem: (item: Omit<QuoteCartItem, "quantity">, quantity?: number) => void;
  removeItem: (itemKey: string) => void;
  setQuantity: (itemKey: string, quantity: number) => void;
  clear: () => void;
}

export const useQuoteCart = create<QuoteCartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.itemKey === item.itemKey);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.itemKey === item.itemKey
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      removeItem: (itemKey) =>
        set((state) => ({
          items: state.items.filter((i) => i.itemKey !== itemKey),
        })),
      setQuantity: (itemKey, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.itemKey !== itemKey)
              : state.items.map((i) =>
                  i.itemKey === itemKey ? { ...i, quantity } : i
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
