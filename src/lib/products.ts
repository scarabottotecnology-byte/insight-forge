import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/catalog";

export type Category = { slug: string; name: string; note: string };

type Cache<T> = { data: T; expiresAt: number };
const TTL_MS = 60_000;

let productsCache: Cache<Product[]> | null = null;
let categoriesCache: Cache<Category[]> | null = null;

export async function fetchProducts(): Promise<Product[]> {
  if (productsCache && productsCache.expiresAt > Date.now()) return productsCache.data;
  const snap = await getDocs(query(collection(db, "products")));
  const data = snap.docs.map((d) => d.data() as Product);
  productsCache = { data, expiresAt: Date.now() + TTL_MS };
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  if (categoriesCache && categoriesCache.expiresAt > Date.now()) return categoriesCache.data;
  const snap = await getDocs(collection(db, "categories"));
  const data = snap.docs.map((d) => d.data() as Category);
  categoriesCache = { data, expiresAt: Date.now() + TTL_MS };
  return data;
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  const cached = productsCache?.expiresAt && productsCache.expiresAt > Date.now()
    ? productsCache.data.find((p) => p.slug === slug)
    : undefined;
  if (cached) return cached;
  const snap = await getDoc(doc(db, "products", slug));
  return snap.exists() ? (snap.data() as Product) : undefined;
}
