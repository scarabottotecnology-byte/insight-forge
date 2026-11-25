import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { listDeliverables, readDeliverable, type DeliverableFile } from "@/lib/deliverables.server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { Order, OrderStatus, PaymentMethod } from "@/lib/firestore-schema";

async function uidFrom(idToken: string) {
  const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null);
  if (!decoded) throw new Error("Sessão expirada. Entre novamente.");
  return decoded.uid;
}

async function ordersOf(uid: string) {
  const snap = await adminDb.collection("orders").where("userId", "==", uid).get();
  return snap.docs.map((d) => d.data() as Order).sort((a, b) => b.createdAt - a.createdAt);
}

export type LibraryProduct = {
  slug: string;
  name: string;
  purchasedAt: number;
  files: DeliverableFile[];
};

export type LibraryOrder = {
  id: string;
  createdAt: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | undefined;
  invoiceUrl?: string | undefined;
  items: { slug: string; name: string }[];
};

/** Products the user has paid for (with their files) plus the order history. */
export const getMyLibrary = createServerFn({ method: "POST" })
  .validator(z.object({ idToken: z.string().min(1) }))
  .handler(async ({ data }) => {
    const uid = await uidFrom(data.idToken);
    const orders = await ordersOf(uid);

    const owned = new Map<string, LibraryProduct>();
    for (const order of orders) {
      if (order.status !== "paid") continue;
      for (const item of order.items) {
        if (owned.has(item.productSlug)) continue;
        owned.set(item.productSlug, {
          slug: item.productSlug,
          name: item.name,
          purchasedAt: order.createdAt,
          files: listDeliverables(item.productSlug),
        });
      }
    }

    const history: LibraryOrder[] = orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      total: o.total,
      status: o.status,
      paymentMethod: o.paymentMethod,
      // The Asaas payment page is only useful while the order still awaits payment.
      invoiceUrl: o.status === "pending" ? o.invoiceUrl : undefined,
      items: o.items.map((i) => ({ slug: i.productSlug, name: i.name })),
    }));

    return { products: [...owned.values()], orders: history };
  });

/**
 * Returns one product file, base64-encoded, only when the caller has a paid order for
 * that product and the file belongs to it. The files are never exposed by URL.
 */
export const downloadDeliverable = createServerFn({ method: "POST" })
  .validator(
    z.object({ idToken: z.string().min(1), slug: z.string().min(1), file: z.string().min(1) }),
  )
  .handler(async ({ data }) => {
    const uid = await uidFrom(data.idToken);
    const orders = await ordersOf(uid);
    const owns = orders.some(
      (o) => o.status === "paid" && o.items.some((i) => i.productSlug === data.slug),
    );
    if (!owns) throw new Error("Este produto não está entre as suas compras.");

    const file = readDeliverable(data.slug, data.file);
    if (!file) throw new Error("Arquivo não encontrado.");
    return file;
  });
