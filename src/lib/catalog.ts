export type ProductType =
  | "Planilha"
  | "Dashboard"
  | "E-book"
  | "Template"
  | "Documento"
  | "Checklist"
  | "Kit";

export type ProductTier = "free" | "entry" | "core" | "premium" | "bundle";

export type Product = {
  slug: string;
  name: string;
  category: string;
  type: ProductType;
  tier: ProductTier;
  level: "Essencial" | "Intermediário" | "Avançado";
  price: number;
  compareAt?: number;
  badge?: string;
  tagline: string;
  problem: string;
  solution: string;
  includes: string[];
  benefits: string[];
  specs: { label: string; value: string }[];
  audience: string[];
  faq: { q: string; a: string }[];
  bundleOf?: string[];
  image: string;
  featured?: boolean;
  bestSeller?: boolean;
};

export const brl = (v: number) =>
  v === 0 ? "Gratuito" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Products, categories and posts live in Firestore now — see src/lib/products.ts,
// scripts/seed-catalog.mjs, scripts/seed-posts.mjs and src/lib/firestore-schema.ts.
