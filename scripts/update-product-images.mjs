// Updates the `image` field of each product document in Firestore to point at
// its image under public/images/products/{slug}.jpg — generated from the real
// product files by scripts/generate-product-images.py — replacing the old shared
// mockup-kit.jpg / mockup-dashboard.jpg / mockup-ebook.jpg. Also updates `badge` for the 3 products whose new
// cover text was aligned with the catalog during review (see PR description).
//
// Usage:
//   bun scripts/update-product-images.mjs
//
// Requires FIREBASE_SERVICE_ACCOUNT in the environment (see .env.example).
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Bump when the images are regenerated (scripts/generate-product-images.py), so browsers
// and the CDN fetch the new files instead of a cached copy of the old ones.
const IMAGE_VERSION = "2026-11-22";

const PRODUCTS = [
  { slug: "planilha-fluxo-de-caixa-empresarial" },
  { slug: "dashboard-financeiro-gerencial" },
  { slug: "planilha-dre-gerencial", badge: "Mais vendido" },
  { slug: "modelo-de-business-plan" },
  { slug: "planilha-de-precificacao" },
  { slug: "kit-financeiro-empresarial", badge: "Kit · 4 itens" },
  { slug: "plano-de-negocios-enxuto" },
  { slug: "checklist-abertura-de-empresa" },
  { slug: "modelo-de-planejamento-estrategico" },
  { slug: "kit-gestao-empresarial", badge: "Kit · 3 itens" },
  { slug: "ebook-gestao-financeira-na-pratica" },
  { slug: "planilha-orcamento-empresarial" },
];

async function main() {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const app = initializeApp({ credential: cert(sa) });
  const db = getFirestore(app);

  const now = Date.now();
  const batch = db.batch();
  for (const { slug, badge } of PRODUCTS) {
    const ref = db.collection("products").doc(slug);
    const data = { image: `/images/products/${slug}.jpg?v=${IMAGE_VERSION}`, updatedAt: now };
    if (badge) data.badge = badge;
    batch.update(ref, data);
  }
  await batch.commit();
  console.log(`Updated image field for ${PRODUCTS.length} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
