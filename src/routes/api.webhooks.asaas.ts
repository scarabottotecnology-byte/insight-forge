import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getAdminDb } from "@/lib/firebase-admin";
import { issueGrantsForOrder, revokeGrantsForOrder } from "@/lib/fulfillment";
import type { Order, OrderStatus } from "@/lib/firestore-schema";

type AsaasWebhookPayload = {
  event: string;
  payment?: {
    id: string;
    status: string;
    externalReference?: string;
  };
};

const STATUS_BY_EVENT: Record<string, OrderStatus | undefined> = {
  PAYMENT_CONFIRMED: "paid",
  PAYMENT_RECEIVED: "paid",
  PAYMENT_REFUNDED: "refunded",
  PAYMENT_REFUND_IN_PROGRESS: "refunded",
  PAYMENT_CHARGEBACK_REQUESTED: "refunded",
  PAYMENT_CHARGEBACK_DISPUTE: "refunded",
  PAYMENT_DELETED: "canceled",
  PAYMENT_CANCELED: "canceled",
};

/** Constant-time compare so the token can't be recovered one character at a time. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Asaas doesn't sign webhook payloads — it just replays back whatever header value was
// configured when the webhook URL was registered in the dashboard. We compare that against
// ASAAS_WEBHOOK_TOKEN. This fails closed: with the token unset, an unauthenticated POST
// here would hand out paid products for free, so an unconfigured webhook rejects everything.
function authorize(request: Request): { ok: true } | { ok: false; status: number; body: string } {
  const expected = process.env["ASAAS_WEBHOOK_TOKEN"];
  if (!expected) {
    console.error("ASAAS_WEBHOOK_TOKEN não configurada — webhook do Asaas recusado.");
    return { ok: false, status: 503, body: "Webhook not configured" };
  }
  const received = request.headers.get("asaas-access-token");
  if (!received || !safeEqual(received, expected)) {
    return { ok: false, status: 401, body: "Unauthorized" };
  }
  return { ok: true };
}

export const Route = createFileRoute("/api/webhooks/asaas")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = authorize(request);
        if (!auth.ok) return new Response(auth.body, { status: auth.status });

        const payload = (await request.json().catch(() => null)) as AsaasWebhookPayload | null;
        const payment = payload?.payment;
        if (!payload?.event || !payment?.id) {
          return new Response("Bad request", { status: 400 });
        }

        const nextStatus = STATUS_BY_EVENT[payload.event];
        if (!nextStatus) {
          // Event we don't act on (e.g. PAYMENT_OVERDUE, PAYMENT_CREATED) — acknowledge and skip.
          return new Response("ok", { status: 200 });
        }

        const db = getAdminDb();
        let orderRef = payment.externalReference
          ? db.collection("orders").doc(payment.externalReference)
          : null;
        let orderSnap = orderRef ? await orderRef.get() : null;

        if (!orderSnap?.exists) {
          const byPaymentRef = await db
            .collection("orders")
            .where("paymentRef", "==", payment.id)
            .limit(1)
            .get();
          if (byPaymentRef.empty) {
            // Order not found — nothing to reconcile, but ack so Asaas stops retrying.
            return new Response("ok", { status: 200 });
          }
          orderRef = byPaymentRef.docs[0]!.ref;
          orderSnap = byPaymentRef.docs[0]!;
        }

        await orderRef!.update({ status: nextStatus, updatedAt: Date.now() });
        const order = { ...(orderSnap.data() as Order), status: nextStatus };

        // Delivery (V-203): a confirmed payment is what turns an order into download grants.
        // Both paths are idempotent, so an Asaas retry of the same event changes nothing.
        try {
          if (nextStatus === "paid") {
            const { missingDeliverable } = await issueGrantsForOrder(order);
            if (missingDeliverable.length > 0) {
              console.error(
                `Pedido ${order.id} pago, mas sem arquivo cadastrado em deliverables/ para: ` +
                  missingDeliverable.join(", "),
              );
            }
          } else {
            await revokeGrantsForOrder(order.id);
          }
        } catch (error) {
          // The status update above already landed; losing the ack would make Asaas retry the
          // whole event, so log loudly and let the retry (or a manual re-issue) catch up.
          console.error(`Falha ao atualizar os downloads do pedido ${order.id}:`, error);
          return new Response("delivery failed", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
