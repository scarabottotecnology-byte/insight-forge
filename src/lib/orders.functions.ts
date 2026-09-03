import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { Order, OrderItem } from "@/lib/firestore-schema";
import type { Product } from "@/lib/catalog";

const inputSchema = z.object({
  idToken: z.string().min(1),
  items: z.array(z.object({ slug: z.string().min(1), qty: z.number().int().positive() })).min(1),
  couponCode: z.string().optional(),
});

// Mirrors the client-side check in carrinho.tsx until V-207 backs coupons with a real
// Firestore collection — kept here too so the discount can never be spoofed by the client.
function couponDiscount(code: string | undefined, subtotal: number) {
  if (code && code.trim().toUpperCase() === "VERTICE10") return Math.round(subtotal * 0.1);
  return 0;
}

/**
 * Creates a real order document. Prices are always re-read from Firestore here —
 * the client's cart data is only ever used for which slugs/quantities were requested.
 *
 * Paid checkout isn't wired up yet (V-201/V-202), so a cart with any non-zero-price
 * item is rejected rather than left as a "pending" order nothing can ever confirm.
 * Zero-total carts (the free checklist) are written as "paid" immediately.
 */
export const createOrder = createServerFn({ method: "POST" })
  .validator(inputSchema)
  .handler(async ({ data }) => {
    const decoded = await adminAuth.verifyIdToken(data.idToken).catch(() => null);
    if (!decoded) throw new Error("Sessão expirada. Entre novamente para finalizar a compra.");

    const productSnaps = await Promise.all(
      data.items.map((i) => adminDb.collection("products").doc(i.slug).get()),
    );

    const items: OrderItem[] = [];
    for (const [i, requested] of data.items.entries()) {
      const snap = productSnaps[i];
      if (!snap?.exists) continue;
      const product = snap.data() as Product;
      items.push({
        productSlug: product.slug,
        name: product.name,
        unitPrice: product.price,
        quantity: requested.qty,
      });
    }
    if (items.length === 0) throw new Error("Nenhum item válido no carrinho.");

    const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    const discount = couponDiscount(data.couponCode, subtotal);
    const total = Math.max(subtotal - discount, 0);

    if (total > 0) {
      throw new Error("O pagamento ainda não está disponível — em breve. Por enquanto só é possível finalizar carrinhos apenas com itens gratuitos.");
    }

    const now = Date.now();
    const ref = adminDb.collection("orders").doc();
    const order: Order = {
      id: ref.id,
      userId: decoded.uid,
      items,
      total,
      status: "paid",
      paymentProvider: "free",
      createdAt: now,
      updatedAt: now,
      ...(data.couponCode ? { couponCode: data.couponCode } : {}),
    };
    await ref.set(order);

    return { orderId: ref.id };
  });
