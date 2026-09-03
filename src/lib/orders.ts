import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { DownloadGrant, Order, OrderItem } from "@/lib/firestore-schema";

const MAX_ITEMS = 50;
const MAX_QTY = 20;
const DOWNLOAD_MAX_COUNT = 5;
const DOWNLOAD_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const createOrderInput = z.object({
  idToken: z.string().min(1),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        qty: z.number().int().min(1).max(MAX_QTY),
      }),
    )
    .min(1)
    .max(MAX_ITEMS),
  couponCode: z.string().trim().min(1).max(40).optional(),
});

/**
 * Creates a pending order with prices revalidated against Firestore — the client only
 * sends product slugs and quantities, never prices, so a tampered cart can't under-pay.
 * Status starts "pending"; only the future payment webhook (V-202) moves it to "paid"
 * via `markOrderPaid` below.
 */
export const createOrder = createServerFn({ method: "POST" })
  .validator(createOrderInput)
  .handler(async ({ data }) => {
    const decoded = await adminAuth.verifyIdToken(data.idToken).catch(() => null);
    if (!decoded) throw new Error("Não autenticado.");

    const refs = data.items.map((item) => adminDb.collection("products").doc(item.slug));
    const snaps = await adminDb.getAll(...refs);

    const items: OrderItem[] = snaps.map((snap, i) => {
      const input = data.items[i];
      if (!input) throw new Error("Item de carrinho inválido.");
      if (!snap.exists) throw new Error(`Produto não encontrado: ${input.slug}`);
      const product = snap.data() as { name: string; price: number };
      return {
        productSlug: input.slug,
        name: product.name,
        unitPrice: product.price,
        quantity: input.qty,
      };
    });

    const total = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const now = Date.now();
    const ref = adminDb.collection("orders").doc();

    const order: Order = {
      id: ref.id,
      userId: decoded.uid,
      items,
      total,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      ...(data.couponCode ? { couponCode: data.couponCode } : {}),
    };
    await ref.set(order);
    return order;
  });

/**
 * Server-only — deliberately not a createServerFn. Marking an order paid must only ever
 * happen from a trusted server context (the payment webhook, V-202), never from a client
 * call, or any authenticated user could grant themselves a free "paid" order.
 */
export async function markOrderPaid(
  orderId: string,
  payment: { provider: string; ref: string },
): Promise<void> {
  await adminDb.collection("orders").doc(orderId).update({
    status: "paid",
    paymentProvider: payment.provider,
    paymentRef: payment.ref,
    updatedAt: Date.now(),
  });
}

/**
 * Server-only, same reasoning as `markOrderPaid` — issuing a download grant is what
 * actually unlocks a file, so it must only run right after a verified payment.
 * `storagePath` follows the `private/{slug}.zip` convention private Storage is expected
 * to use once V-203 stands it up; adjust here if that lands with a different layout.
 */
export async function issueDownloadGrants(order: Order): Promise<DownloadGrant[]> {
  const now = Date.now();
  const batch = adminDb.batch();
  const grants: DownloadGrant[] = order.items.map((item) => {
    const ref = adminDb.collection("downloads").doc();
    const grant: DownloadGrant = {
      id: ref.id,
      orderId: order.id,
      userId: order.userId,
      productSlug: item.productSlug,
      storagePath: `private/${item.productSlug}.zip`,
      downloadCount: 0,
      maxDownloads: DOWNLOAD_MAX_COUNT,
      expiresAt: now + DOWNLOAD_TTL_MS,
      createdAt: now,
    };
    batch.set(ref, grant);
    return grant;
  });
  await batch.commit();
  return grants;
}
