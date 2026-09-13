import type { Product } from "@/lib/catalog";

/**
 * Firestore collection layout (replaces the Postgres tables/RLS design in ROADMAP.md's V-102
 * now that the backend is Firebase — see memory for the 2026-08-23 architecture pivot):
 *
 * - `products/{slug}`       — catalog, public read, admin-only write (via Admin SDK / custom claim).
 * - `profiles/{uid}`        — user-editable profile data only. Role lives in the Firebase Auth
 *                             custom claim `role` ("admin" | "cliente"), not in this doc, so a
 *                             client write can never grant itself admin.
 * - `orders/{orderId}`      — order + line items embedded (denormalized; a digital-goods cart is
 *                             small, no need for a separate order_items collection). Client-created
 *                             via a server function that revalidates prices; never written directly
 *                             from the browser. Owner can read; only server/admin can write.
 * - `downloads/{grantId}`   — one signed-download grant per (order, product). Server-only writes;
 *                             owner can read to see remaining download count / expiry.
 * - `deliverables/{slug}`   — private storage path of each product's file (V-203). No client
 *                             access at all; only the Admin SDK resolves it.
 * - `downloadLogs/{logId}`  — audit trail of every signed link handed out (V-204).
 */

export type UserRole = "admin" | "cliente";

export type Profile = {
  uid: string;
  email: string;
  displayName?: string;
  marketingOptIn: boolean;
  createdAt: number;
  updatedAt: number;
};

export type OrderStatus = "pending" | "paid" | "refunded" | "canceled";

export type OrderItem = {
  productSlug: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type PaymentMethod = "PIX" | "BOLETO" | "CREDIT_CARD";

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  couponCode?: string;
  total: number;
  status: OrderStatus;
  paymentProvider?: string;
  paymentRef?: string;
  paymentMethod?: PaymentMethod;
  // Denormalized display data for the checkout result screen — refreshed by the
  // Asaas webhook (src/routes/api.webhooks.asaas.ts) as the payment status changes.
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixPayload?: string;
  pixQrCodeImage?: string;
  pixExpiresAt?: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Private file behind a product (V-203). Lives in its own collection instead of on the
 * public `products/{slug}` doc so the storage path is never readable from the browser —
 * Firestore rules deny every client read, and only the Admin SDK ever resolves it.
 */
export type Deliverable = {
  productSlug: string;
  storagePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  updatedAt: number;
};

export type DownloadGrant = {
  id: string;
  orderId: string;
  userId: string;
  productSlug: string;
  storagePath: string;
  fileName: string;
  downloadCount: number;
  maxDownloads: number;
  /** Set by a refund/chargeback webhook — the grant stays for the audit trail but stops working. */
  revoked: boolean;
  revokedAt?: number;
  expiresAt: number;
  createdAt: number;
};

/** One row per signed URL handed out (V-204). Server-only writes, admin-only reads. */
export type DownloadLog = {
  grantId: string;
  orderId: string;
  userId: string;
  productSlug: string;
  downloadNumber: number;
  userAgent?: string;
  createdAt: number;
};

export type FirestoreProduct = Product & {
  createdAt: number;
  updatedAt: number;
};

export type PostSection = {
  heading: string;
  paragraphs: string[];
};

export type Lead = {
  email: string;
  name?: string;
  source: string;
  magnetSlug?: string;
  createdAt: number;
};

export type Post = {
  slug: string;
  kicker: string;
  title: string;
  excerpt: string;
  related?: string;
  readTime: string;
  sections: PostSection[];
  createdAt: number;
  updatedAt: number;
};
