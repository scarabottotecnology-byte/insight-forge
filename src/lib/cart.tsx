import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "@/lib/catalog";

const STORAGE_KEY = "vertice.cart.v1";

type CartItem = { slug: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  detailed: { product: Product; qty: number }[];
  count: number;
  subtotal: number;
  savings: number;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((slug: string) => {
    setItems((prev) => (prev.some((i) => i.slug === slug) ? prev : [...prev, { slug, qty: 1 }]));
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const detailed = items
      .map((i) => {
        const product = products.find((p) => p.slug === i.slug);
        return product ? { product, qty: i.qty } : null;
      })
      .filter((x): x is { product: Product; qty: number } => Boolean(x));

    const subtotal = detailed.reduce((acc, i) => acc + i.product.price * i.qty, 0);
    const savings = detailed.reduce(
      (acc, i) => acc + (i.product.compareAt ? (i.product.compareAt - i.product.price) * i.qty : 0),
      0,
    );

    return {
      items,
      detailed,
      count: detailed.length,
      subtotal,
      savings,
      add,
      remove,
      clear,
      has: (slug: string) => items.some((i) => i.slug === slug),
    };
  }, [items, add, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
