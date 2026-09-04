// Seeds the free lead-magnet product (Planilha Gratuita de Fluxo de Caixa) into Firestore.
// Standalone (doesn't depend on src/lib/catalog.ts, which no longer exports product data
// now that the catalog lives in Firestore — see scripts/seed-catalog.mjs's header comment).
//
// Usage:
//   FIREBASE_SERVICE_ACCOUNT='<service account JSON>' bun scripts/seed-free-cashflow.mjs
//
// Requires FIREBASE_SERVICE_ACCOUNT in the environment (see .env.example). Idempotent —
// safe to re-run, it always overwrites the same product doc.
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const product = {
  slug: "planilha-gratuita-fluxo-de-caixa",
  name: "Planilha Gratuita de Fluxo de Caixa Empresarial",
  category: "Finanças",
  type: "Planilha",
  tier: "free",
  level: "Essencial",
  price: 0,
  badge: "Gratuito",
  image: "/images/mockup-kit.jpg",
  tagline: "Organize entradas e saídas do mês e veja se o caixa fechou positivo — em uma página.",
  problem:
    "Pequenos negócios e empreendedores não têm uma rotina simples de controle de caixa e só percebem um problema de liquidez depois que ele já aconteceu.",
  solution:
    "Uma planilha de uma página para lançar entradas, saídas fixas e variáveis, com saldo do mês e saldo acumulado calculados automaticamente.",
  includes: [
    "Planilha em Excel (.xlsx) com fluxo de caixa mensal e fórmulas prontas",
    "Aba de projeção de 3 meses com gráfico de saldo acumulado",
    "Guia rápido de uso na capa do arquivo",
  ],
  benefits: [
    "Saber se o mês fechou positivo ou negativo em minutos",
    "Primeira rotina de controle antes de evoluir para o Kit Financeiro Empresarial",
    "Acesso imediato, sem custo",
  ],
  specs: [
    { label: "Formato", value: "Excel (.xlsx)" },
    { label: "Compatibilidade", value: "Excel 2016+, Google Sheets" },
    { label: "Fórmulas", value: "Desbloqueadas e documentadas" },
  ],
  audience: [
    "Pequenos negócios e autônomos",
    "Empreendedores em fase inicial",
    "Quem ainda controla o caixa no caderno ou no WhatsApp",
  ],
  faq: [
    {
      q: "É realmente gratuito?",
      a: "Sim. Pedimos apenas o e-mail para enviar o acesso e novidades do catálogo.",
    },
    { q: "Funciona no Google Sheets?", a: "Sim, todas as fórmulas são compatíveis." },
    {
      q: "Qual a diferença para a Planilha de Fluxo de Caixa Empresarial paga?",
      a: "A versão gratuita cobre um mês por vez; a versão paga traz projeção de 12 meses, alertas de saldo mínimo e painel de indicadores.",
    },
  ],
};

async function main() {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const app = initializeApp({ credential: cert(sa) });
  const db = getFirestore(app);

  const now = Date.now();
  await db
    .collection("products")
    .doc(product.slug)
    .set({ ...product, createdAt: now, updatedAt: now }, { merge: true });

  console.log(`Seeded product "${product.slug}".`);
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
