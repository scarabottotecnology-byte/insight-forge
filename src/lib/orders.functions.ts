import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPayment, findOrCreateCustomer, getPixQrCode } from "@/lib/asaas.server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { issueGrantsForOrder } from "@/lib/fulfillment";
import type { Order, OrderItem } from "@/lib/firestore-schema";
import type { Product } from "@/lib/catalog";

const payerSchema = z.object({
  name: z.string().min(3, "Informe o nome completo."),
  email: z.string().email(),
  cpfCnpj: z.string().min(11, "CPF ou CNPJ inválido."),
  phone: z.string().min(10, "Informe um telefone com DDD."),
});

const creditCardSchema = z.object({
  holderName: z.string().min(3),
  number: z.string().min(13),
  expiryMonth: z.string().min(1).max(2),
  expiryYear: z.string().min(2).max(4),
  ccv: z.string().min(3).max(4),
  postalCode: z.string().min(8),
  addressNumber: z.string().min(1),
});

const inputSchema = z.object({
  idToken: z.string().min(1),
  items: z.array(z.object({ slug: z.string().min(1), qty: z.number().int().positive() })).min(1),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]).optional(),
  payer: payerSchema.optional(),
  creditCard: creditCardSchema.optional(),
});

// Mirrors the client-side check in carrinho.tsx until V-207 backs coupons with a real
// Firestore collection — kept here too so the discount can never be spoofed by the client.
function couponDiscount(code: string | undefined, subtotal: number) {
  if (code && code.trim().toUpperCase() === "VERTICE10") return Math.round(subtotal * 0.1);
  return 0;
}

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Creates a real order document. Prices are always re-read from Firestore here —
 * the client's cart data is only ever used for which slugs/quantities were requested.
 *
 * Zero-total carts (the free checklist) are written as "paid" immediately. Paid carts
 * go through Asaas: PIX/Boleto come back "pending" until the webhook
 * (src/routes/api.webhooks.asaas.ts) confirms payment; credit card is confirmed (or
 * declined) synchronously by Asaas at creation time.
 */
export const createOrder = createServerFn({ method: "POST" })
  .validator(inputSchema)
  .handler(async ({ data }) => {
    const decoded = await getAdminAuth()
      .verifyIdToken(data.idToken)
      .catch(() => null);
    if (!decoded) throw new Error("Sessão expirada. Entre novamente para finalizar a compra.");

    const productSnaps = await Promise.all(
      data.items.map((i) => getAdminDb().collection("products").doc(i.slug).get()),
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

    const now = Date.now();
    const ref = getAdminDb().collection("orders").doc();

    if (total === 0) {
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
      await releaseFiles(order);
      return { orderId: ref.id, status: "paid" as const };
    }

    if (!data.paymentMethod || !data.payer) {
      throw new Error("Selecione uma forma de pagamento e informe seus dados para continuar.");
    }
    if (data.paymentMethod === "CREDIT_CARD" && !data.creditCard) {
      throw new Error("Informe os dados do cartão para continuar.");
    }

    const description = `Pedido Vértice — ${items.map((i) => i.name).join(", ")}`.slice(0, 500);

    const customer = await findOrCreateCustomer({
      name: data.payer.name,
      email: data.payer.email,
      cpfCnpj: data.payer.cpfCnpj,
      phone: data.payer.phone,
    });

    const payment = await createPayment({
      customerId: customer.id,
      billingType: data.paymentMethod,
      value: total,
      description,
      externalReference: ref.id,
      dueDate: tomorrowIso(),
      ...(data.paymentMethod === "CREDIT_CARD" && data.creditCard
        ? {
            creditCard: {
              holderName: data.creditCard.holderName,
              number: data.creditCard.number.replace(/\s/g, ""),
              expiryMonth: data.creditCard.expiryMonth,
              expiryYear: data.creditCard.expiryYear,
              ccv: data.creditCard.ccv,
            },
            creditCardHolderInfo: {
              name: data.payer.name,
              email: data.payer.email,
              cpfCnpj: data.payer.cpfCnpj,
              postalCode: data.creditCard.postalCode,
              addressNumber: data.creditCard.addressNumber,
              phone: data.payer.phone,
            },
          }
        : {}),
    });

    const status =
      payment.status === "CONFIRMED" || payment.status === "RECEIVED" ? "paid" : "pending";

    let pix: { payload: string; encodedImage: string; expirationDate: string } | null = null;
    if (data.paymentMethod === "PIX") {
      pix = await getPixQrCode(payment.id).catch(() => null);
    }

    const order: Order = {
      id: ref.id,
      userId: decoded.uid,
      items,
      total,
      status,
      paymentProvider: "asaas",
      paymentRef: payment.id,
      paymentMethod: data.paymentMethod,
      invoiceUrl: payment.invoiceUrl,
      ...(payment.bankSlipUrl ? { bankSlipUrl: payment.bankSlipUrl } : {}),
      ...(pix
        ? {
            pixPayload: pix.payload,
            pixQrCodeImage: pix.encodedImage,
            pixExpiresAt: pix.expirationDate,
          }
        : {}),
      createdAt: now,
      updatedAt: now,
      ...(data.couponCode ? { couponCode: data.couponCode } : {}),
    };
    await ref.set(order);

    // A credit card approved at creation time never produces a webhook we have to wait for,
    // so the files are released right here. PIX/Boleto stay pending until the webhook lands.
    if (status === "paid") await releaseFiles(order);

    return {
      orderId: ref.id,
      status,
      paymentMethod: data.paymentMethod,
      invoiceUrl: order.invoiceUrl,
      bankSlipUrl: order.bankSlipUrl,
      pixPayload: order.pixPayload,
      pixQrCodeImage: order.pixQrCodeImage,
      pixExpiresAt: order.pixExpiresAt,
    };
  });

/**
 * Releases the purchased files (V-203) without ever failing the checkout over it.
 *
 * The order is already written — and, on the card path, already charged. Throwing here
 * would show the buyer an error for a purchase that actually went through, so a delivery
 * problem is logged for support to re-issue instead of surfacing as a failed payment.
 */
async function releaseFiles(order: Order) {
  try {
    const { missingDeliverable } = await issueGrantsForOrder(order);
    if (missingDeliverable.length > 0) {
      console.error(
        `Pedido ${order.id} pago, mas sem arquivo cadastrado em deliverables/ para: ` +
          missingDeliverable.join(", "),
      );
    }
  } catch (error) {
    console.error(`Falha ao liberar os downloads do pedido ${order.id}:`, error);
  }
}

const orderStatusSchema = z.object({ idToken: z.string().min(1), orderId: z.string().min(1) });

/** Lets the checkout result screen poll for PIX/Boleto confirmation without re-reading Firestore rules from the client. */
export const getOrderStatus = createServerFn({ method: "POST" })
  .validator(orderStatusSchema)
  .handler(async ({ data }) => {
    const decoded = await getAdminAuth()
      .verifyIdToken(data.idToken)
      .catch(() => null);
    if (!decoded) throw new Error("Sessão expirada.");

    const snap = await getAdminDb().collection("orders").doc(data.orderId).get();
    if (!snap.exists) throw new Error("Pedido não encontrado.");
    const order = snap.data() as Order;
    if (order.userId !== decoded.uid) throw new Error("Pedido não encontrado.");

    return { status: order.status };
  });
