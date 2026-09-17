import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { ConfigError, getAdminAuth, getAdminDb, getDeliverablesBucket } from "@/lib/firebase-admin";
import type { DownloadGrant, DownloadLog, Order } from "@/lib/firestore-schema";

/**
 * Private delivery of purchased files (V-203) with a per-order download budget and an
 * audit trail (V-204).
 *
 * The files live in a Storage bucket whose rules deny every client read (`storage.rules`),
 * so the browser can never reach them by path. The only way out is a short-lived V4 signed
 * URL minted here, and only after this server function has verified — with the Admin SDK,
 * never with client-supplied data — that the caller owns a paid order for that product.
 */

const DEFAULT_LINK_TTL_MINUTES = 15;

function linkTtlMs(): number {
  const parsed = Number(process.env["DOWNLOAD_LINK_TTL_MINUTES"]);
  const minutes = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LINK_TTL_MINUTES;
  return minutes * 60 * 1000;
}

async function requireUid(idToken: string): Promise<string> {
  const decoded = await getAdminAuth()
    .verifyIdToken(idToken)
    .catch(() => null);
  if (!decoded) throw new Error("Sessão expirada. Entre novamente para acessar seus downloads.");
  return decoded.uid;
}

export type LibraryItem = {
  grantId: string;
  orderId: string;
  productSlug: string;
  fileName: string;
  downloadsUsed: number;
  maxDownloads: number;
  expiresAt: number;
  available: boolean;
  /** Why it isn't available, when it isn't — shown verbatim in the account page. */
  unavailableReason?: string;
};

export type LibraryOrder = {
  id: string;
  total: number;
  status: Order["status"];
  createdAt: number;
  items: { productSlug: string; name: string; unitPrice: number; quantity: number }[];
  invoiceUrl?: string;
};

function describeUnavailable(grant: DownloadGrant, now: number): string | undefined {
  if (grant.revoked) return "Acesso revogado (pedido reembolsado ou cancelado).";
  if (grant.expiresAt <= now) return "Link expirado. Fale com o suporte para reemitir.";
  if (grant.downloadCount >= grant.maxDownloads)
    return `Limite de ${grant.maxDownloads} downloads atingido.`;
  return undefined;
}

const idTokenSchema = z.object({ idToken: z.string().min(1) });

/**
 * Everything the account page needs: the buyer's orders and the download grants those
 * orders produced. Read server-side so the page renders the same data the signing step
 * will enforce, instead of a client-side guess at what was purchased.
 */
export const listMyLibrary = createServerFn({ method: "POST" })
  .validator(idTokenSchema)
  .handler(async ({ data }) => {
    const uid = await requireUid(data.idToken);
    const db = getAdminDb();

    const [orderSnap, grantSnap] = await Promise.all([
      db.collection("orders").where("userId", "==", uid).get(),
      db.collection("downloads").where("userId", "==", uid).get(),
    ]);

    const now = Date.now();

    const orders: LibraryOrder[] = orderSnap.docs
      .map((d) => d.data() as Order)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((o) => ({
        id: o.id,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
        items: o.items,
        ...(o.invoiceUrl ? { invoiceUrl: o.invoiceUrl } : {}),
      }));

    const items: LibraryItem[] = grantSnap.docs
      .map((d) => d.data() as DownloadGrant)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((grant) => {
        const reason = describeUnavailable(grant, now);
        return {
          grantId: grant.id,
          orderId: grant.orderId,
          productSlug: grant.productSlug,
          fileName: grant.fileName,
          downloadsUsed: grant.downloadCount,
          maxDownloads: grant.maxDownloads,
          expiresAt: grant.expiresAt,
          available: !reason,
          ...(reason ? { unavailableReason: reason } : {}),
        };
      });

    return { orders, items };
  });

const downloadLinkSchema = z.object({
  idToken: z.string().min(1),
  grantId: z.string().min(1),
});

/**
 * Mints one short-lived signed URL and spends one download from the grant's budget.
 *
 * The spend happens in a transaction so two tabs clicking at once can't both slip past the
 * last remaining download. Signing is attempted first: a storage object that has gone
 * missing should surface as an error, not as a silently consumed download.
 */
export const createDownloadLink = createServerFn({ method: "POST" })
  .validator(downloadLinkSchema)
  .handler(async ({ data }) => {
    const uid = await requireUid(data.idToken);
    const db = getAdminDb();

    const grantRef = db.collection("downloads").doc(data.grantId);
    const grantSnap = await grantRef.get();
    if (!grantSnap.exists) throw new Error("Download não encontrado.");
    const grant = grantSnap.data() as DownloadGrant;

    // Same message for "not yours" and "doesn't exist" — an attacker shouldn't be able to
    // probe which grant ids are real.
    if (grant.userId !== uid) throw new Error("Download não encontrado.");

    const orderSnap = await db.collection("orders").doc(grant.orderId).get();
    const order = orderSnap.data() as Order | undefined;
    if (!order || order.status !== "paid") {
      throw new Error("O pagamento deste pedido ainda não foi confirmado.");
    }

    const blocked = describeUnavailable(grant, Date.now());
    if (blocked) throw new Error(blocked);

    const file = getDeliverablesBucket().file(grant.storagePath);
    const [exists] = await file.exists();
    if (!exists) {
      throw new ConfigError(
        `O arquivo do produto "${grant.productSlug}" não está no Storage (${grant.storagePath}). ` +
          "Envie o arquivo com `bun run upload:deliverable` antes de liberar a venda.",
      );
    }

    const expires = Date.now() + linkTtlMs();
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires,
      responseDisposition: `attachment; filename="${grant.fileName.replace(/"/g, "")}"`,
    });

    // Spend the download only once the URL exists, and re-check the budget inside the
    // transaction so concurrent clicks can't both consume the same last slot.
    const downloadNumber = await db.runTransaction(async (tx) => {
      const fresh = (await tx.get(grantRef)).data() as DownloadGrant | undefined;
      if (!fresh) throw new Error("Download não encontrado.");
      const reason = describeUnavailable(fresh, Date.now());
      if (reason) throw new Error(reason);
      const next = fresh.downloadCount + 1;
      tx.update(grantRef, { downloadCount: next });
      return next;
    });

    const log: DownloadLog = {
      grantId: grant.id,
      orderId: grant.orderId,
      userId: uid,
      productSlug: grant.productSlug,
      downloadNumber,
      createdAt: Date.now(),
      ...userAgentOf(),
    };
    await db.collection("downloadLogs").add(log);

    return {
      url,
      fileName: grant.fileName,
      expiresAt: expires,
      remaining: Math.max(grant.maxDownloads - downloadNumber, 0),
    };
  });

/** Best-effort request metadata for the audit row; never worth failing a download over. */
function userAgentOf(): { userAgent?: string } {
  try {
    const ua = getRequest().headers.get("user-agent");
    return ua ? { userAgent: ua.slice(0, 300) } : {};
  } catch {
    return {};
  }
}
