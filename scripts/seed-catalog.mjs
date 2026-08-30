import { createServer } from "vite";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

async function main() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  const { products, categories } = await server.ssrLoadModule("/src/lib/catalog.ts");
  await server.close();

  // ssrLoadModule resolves image imports to dev-only "/src/assets/..." URLs, which
  // don't exist in a production build. Map them to the stable copies in public/images/.
  const stableImage = (devUrl) => `/images/${devUrl.split("/").pop()}`;
  for (const product of products) {
    product.image = stableImage(product.image);
  }

  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const app = initializeApp({ credential: cert(sa) });
  const db = getFirestore(app);

  const now = Date.now();
  const batch = db.batch();
  for (const product of products) {
    const ref = db.collection("products").doc(product.slug);
    batch.set(ref, { ...product, createdAt: now, updatedAt: now });
  }
  await batch.commit();
  console.log(`Seeded ${products.length} products.`);

  const catBatch = db.batch();
  for (const category of categories) {
    const ref = db.collection("categories").doc(category.slug);
    catBatch.set(ref, category);
  }
  await catBatch.commit();
  console.log(`Seeded ${categories.length} categories.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
