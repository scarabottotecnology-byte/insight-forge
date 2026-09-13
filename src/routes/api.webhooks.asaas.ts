import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { adminDb } from "@/lib/firebase-admin";
import type { OrderStatus } from "@/lib/firestore-schema";

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
  PAYMENT_DELETED: "canceled",
  PAYMENT_CANCELED: "canceled",
};

// Asaas doesn't sign webhook payloads — it just replays back whatever header value
// was configured when the webhook URL was registered in the dashboard. We compare
// that against ASAAS_WEBHOOK_TOKEN so a stranger can't POST fake "paid" events here.
function isAuthorized(request: Request) {
  const expected = process.env["ASAAS_WEBHOOK_TOKEN"];
  if (!expected) return true; // not configured yet — accept, but this should be set before going live
  return request.headers.get("asaas-access-token") === expected;
}

export const Route = createFileRoute("/api/webhooks/asaas")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorized(request)) {
          return new Response("Unauthorized", { status: 401 });
        }

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

        let orderRef = payment.externalReference
          ? adminDb.collection("orders").doc(payment.externalReference)
          : null;
        let orderSnap = orderRef ? await orderRef.get() : null;

        if (!orderSnap?.exists) {
          const bySlug = await adminDb
            .collection("orders")
            .where("paymentRef", "==", payment.id)
            .limit(1)
            .get();
          if (bySlug.empty) {
            // Order not found — nothing to reconcile, but ack so Asaas stops retrying.
            return new Response("ok", { status: 200 });
          }
          orderRef = bySlug.docs[0]!.ref;
          orderSnap = bySlug.docs[0]!;
        }

        await orderRef!.update({ status: nextStatus, updatedAt: Date.now() });

        return new Response("ok", { status: 200 });
      },
    },
  },
});
