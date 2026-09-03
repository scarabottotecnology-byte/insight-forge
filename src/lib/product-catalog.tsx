import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "@/lib/catalog";
import type { Category } from "@/lib/products";

type ProductCatalogValue = {
  products: Product[];
  categories: Category[];
  getProduct: (slug: string) => Product | undefined;
};

const ProductCatalogContext = createContext<ProductCatalogValue | null>(null);

export function ProductCatalogProvider({
  products,
  categories,
  children,
}: {
  products: Product[];
  categories: Category[];
  children: ReactNode;
}) {
  const value = useMemo<ProductCatalogValue>(
    () => ({
      products,
      categories,
      getProduct: (slug) => products.find((p) => p.slug === slug),
    }),
    [products, categories],
  );

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
}

export function useProductCatalog() {
  const ctx = useContext(ProductCatalogContext);
  if (!ctx) throw new Error("useProductCatalog must be used within ProductCatalogProvider");
  return ctx;
}
