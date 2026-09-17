import { basename, extname } from "node:path";
import { readFile } from "node:fs/promises";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Sobe o arquivo de um produto para o Storage privado e registra o caminho em
 * `deliverables/{slug}` (V-203).
 *
 * Uso: bun run upload:deliverable <slug> <caminho-do-arquivo>
 * Ex.: bun run upload:deliverable checklist-abertura-de-empresa deliverables/checklist-abertura-de-empresa.pdf
 *
 * O arquivo vai para `deliverables/{slug}/{nome}`, que `storage.rules` bloqueia para
 * qualquer leitura de cliente — o acesso só acontece por link assinado, gerado no servidor
 * depois de conferir que quem pediu tem um pedido pago (src/lib/downloads.functions.ts).
 */

const CONTENT_TYPES = {
  ".pdf": "application/pdf",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".csv": "text/csv",
  ".zip": "application/zip",
};

async function main() {
  const [slug, filePath] = process.argv.slice(2);
  if (!slug || !filePath) {
    console.error("Uso: bun run upload:deliverable <slug> <caminho-do-arquivo>");
    process.exit(1);
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    console.error("ERROR: FIREBASE_SERVICE_ACCOUNT não está no ambiente.");
    process.exit(1);
  }
  const bucketName =
    process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    console.error("ERROR: FIREBASE_STORAGE_BUCKET (ou VITE_FIREBASE_STORAGE_BUCKET) não definida.");
    process.exit(1);
  }

  const app = initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
  const db = getFirestore(app);
  const bucket = getStorage(app).bucket(bucketName);

  const productSnap = await db.collection("products").doc(slug).get();
  if (!productSnap.exists) {
    console.error(`ERROR: não existe produto "${slug}" no Firestore. Rode 'bun run seed:catalog'.`);
    process.exit(1);
  }

  const contents = await readFile(filePath);
  const fileName = basename(filePath);
  const contentType = CONTENT_TYPES[extname(fileName).toLowerCase()] ?? "application/octet-stream";
  const storagePath = `deliverables/${slug}/${fileName}`;

  await bucket.file(storagePath).save(contents, {
    contentType,
    // Sem `public: true` de propósito: o arquivo nunca pode ter URL pública.
    metadata: { cacheControl: "private, max-age=0, no-store" },
  });

  await db.collection("deliverables").doc(slug).set({
    productSlug: slug,
    storagePath,
    fileName,
    contentType,
    sizeBytes: contents.byteLength,
    updatedAt: Date.now(),
  });

  console.log(`OK: ${fileName} (${contents.byteLength} bytes) → gs://${bucketName}/${storagePath}`);
  console.log(
    `Registrado em deliverables/${slug}. O produto "${productSnap.data().name}" já entrega.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
