// Updates the `image` field of each product document in Firestore to point at
// its new, unique cover under public/images/products/{slug}.jpg — replacing the
// old shared mockup-kit.jpg / mockup-dashboard.jpg / mockup-ebook.jpg reused
// across unrelated products.
//
// Usage:
//   bun scripts/update-product-images.mjs
//
// Requires FIREBASE_SERVICE_ACCOUNT in the environment (see .env.example).
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const SLUGS = [
  "planilha-fluxo-de-caixa-empresarial",
  "dashboard-financeiro-gerencial",
  "planilha-dre-gerencial",
  "modelo-de-business-plan",
  "planilha-de-precificacao",
  "kit-financeiro-empresarial",
  "plano-de-negocios-enxuto",
  "checklist-abertura-de-empresa",
  "modelo-de-planejamento-estrategico",
  "kit-gestao-empresarial",
  "ebook-gestao-financeira-na-pratica",
  "planilha-orcamento-empresarial",
];

async function main() {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const app = initializeApp({ credential: cert(sa) });
  const db = getFirestore(app);

  const now = Date.now();
  const batch = db.batch();
  for (const slug of SLUGS) {
    const ref = db.collection("products").doc(slug);
    batch.update(ref, { image: `/images/products/${slug}.jpg`, updatedAt: now });
  }
  await batch.commit();
  console.log(`Updated image field for ${SLUGS.length} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
