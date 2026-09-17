import { getAdminDb } from "@/lib/firebase-admin";
import type { Deliverable, DownloadGrant, Order } from "@/lib/firestore-schema";

/**
 * Digital delivery (V-203/V-204), shared by the free checkout and the Asaas webhook.
 *
 * A grant is the only thing that can ever produce a download link: it names the buyer,
 * the order, the private storage path, how many downloads are left and when access ends.
 * Nothing here trusts the client — every caller runs on the Admin SDK.
 */

const DEFAULT_MAX_DOWNLOADS = 5;
const DEFAULT_GRANT_DAYS = 365;

function maxDownloads(): number {
  const parsed = Number(process.env["DOWNLOAD_MAX_PER_ORDER"]);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_MAX_DOWNLOADS;
}

function grantTtlMs(): number {
  const parsed = Number(process.env["DOWNLOAD_GRANT_DAYS"]);
  const days = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_GRANT_DAYS;
  return days * 24 * 60 * 60 * 1000;
}

/** Deterministic id, so a replayed webhook rewrites the same grant instead of stacking new ones. */
export const grantId = (orderId: string, productSlug: string) => `${orderId}__${productSlug}`;

/**
 * Issues one download grant per purchased product. Idempotent: an existing grant keeps its
 * `downloadCount` and `createdAt`, so a duplicate PAYMENT_CONFIRMED never silently resets a
 * buyer's quota — and a re-delivered event un-revokes nothing it shouldn't.
 *
 * Products with no registered file are skipped rather than granted: a grant pointing at a
 * storage object that doesn't exist would only fail later, in the buyer's hands.
 */
export async function issueGrantsForOrder(order: Order): Promise<{
  granted: string[];
  missingDeliverable: string[];
}> {
  const db = getAdminDb();
  const now = Date.now();
  const granted: string[] = [];
  const missingDeliverable: string[] = [];

  for (const item of order.items) {
    const deliverableSnap = await db.collection("deliverables").doc(item.productSlug).get();
    if (!deliverableSnap.exists) {
      missingDeliverable.push(item.productSlug);
      continue;
    }
    const deliverable = deliverableSnap.data() as Deliverable;
    const ref = db.collection("downloads").doc(grantId(order.id, item.productSlug));

    await db.runTransaction(async (tx) => {
      const existing = (await tx.get(ref)).data() as DownloadGrant | undefined;
      const grant: DownloadGrant = {
        id: ref.id,
        orderId: order.id,
        userId: order.userId,
        productSlug: item.productSlug,
        storagePath: deliverable.storagePath,
        fileName: deliverable.fileName,
        downloadCount: existing?.downloadCount ?? 0,
        maxDownloads: maxDownloads(),
        revoked: false,
        expiresAt: now + grantTtlMs(),
        createdAt: existing?.createdAt ?? now,
      };
      tx.set(ref, grant);
    });

    granted.push(item.productSlug);
  }

  return { granted, missingDeliverable };
}

/** Refund/chargeback: access is cut off, but the grant (and its audit trail) stays. */
export async function revokeGrantsForOrder(orderId: string): Promise<number> {
  const db = getAdminDb();
  const snap = await db.collection("downloads").where("orderId", "==", orderId).get();
  if (snap.empty) return 0;

  const batch = db.batch();
  for (const doc of snap.docs) {
    batch.update(doc.ref, { revoked: true, revokedAt: Date.now() });
  }
  await batch.commit();
  return snap.size;
}
