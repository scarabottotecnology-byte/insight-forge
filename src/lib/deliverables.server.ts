// Server-only: never import this from client code. It pulls in "virtual:deliverables",
// which embeds the paid product files into the server bundle (scripts/vite-plugin-deliverables.ts).
import files from "virtual:deliverables";

export type DeliverableFile = { name: string; label: string; size: number };

// Which files each product delivers. Kits deliver every file of the products they bundle,
// plus their own manual. File names refer to the ./deliverables folder.
const MANIFEST: Record<string, { file: string; label: string }[]> = {
  "checklist-abertura-de-empresa": [
    { file: "checklist-abertura-de-empresa.pdf", label: "Checklist interativo (PDF)" },
    { file: "checklist-abertura-de-empresa.xlsx", label: "Checklist editável (Excel)" },
  ],
  "dashboard-financeiro-gerencial": [
    {
      file: "dashboard-financeiro-gerencial.xlsx",
      label: "Dashboard Financeiro Gerencial (Excel)",
    },
  ],
  "ebook-gestao-financeira-na-pratica": [
    { file: "gestao-financeira-na-pratica.pdf", label: "E-book (PDF)" },
    { file: "gestao-financeira-na-pratica.epub", label: "E-book (EPUB)" },
    {
      file: "planilha-exemplos-gestao-financeira-na-pratica.xlsx",
      label: "Planilha de exemplos do livro (Excel)",
    },
  ],
  "planilha-de-precificacao": [
    { file: "planilha-de-precificacao.xlsx", label: "Planilha de Precificação (Excel)" },
  ],
  "planilha-dre-gerencial": [
    { file: "planilha-dre-gerencial.xlsx", label: "Planilha de DRE Gerencial (Excel)" },
    { file: "planilha-dre-gerencial-macros-vba.md", label: "Macros VBA opcionais (texto)" },
  ],
  "planilha-fluxo-de-caixa-empresarial": [
    {
      file: "planilha-fluxo-de-caixa-empresarial.xlsx",
      label: "Planilha de Fluxo de Caixa Empresarial (Excel)",
    },
    {
      file: "planilha-fluxo-de-caixa-empresarial-manual.pdf",
      label: "Manual de implantação (PDF)",
    },
  ],
  "planilha-orcamento-empresarial": [
    {
      file: "planilha-orcamento-empresarial.xlsx",
      label: "Planilha de Orçamento Empresarial (Excel)",
    },
  ],
  "plano-de-negocios-enxuto": [
    { file: "plano-de-negocios-enxuto.docx", label: "Plano de Negócios Enxuto (Word)" },
    { file: "plano-de-negocios-enxuto.pdf", label: "Plano de Negócios Enxuto (PDF)" },
  ],
  "modelo-de-planejamento-estrategico": [
    { file: "modelo-de-planejamento-estrategico.docx", label: "Documento de planejamento (Word)" },
    {
      file: "planilha-desdobramento-metas-iniciativas.xlsx",
      label: "Desdobramento de metas e iniciativas (Excel)",
    },
    { file: "apresentacao-de-alinhamento.pptx", label: "Apresentação de alinhamento (PowerPoint)" },
  ],
  "modelo-de-business-plan": [
    { file: "modelo-de-business-plan.docx", label: "Business Plan (Word)" },
    { file: "modelo-financeiro-5-anos.xlsx", label: "Modelo financeiro de 5 anos (Excel)" },
    { file: "apresentacao-executiva.pptx", label: "Apresentação executiva (PowerPoint)" },
  ],
};

const KITS: Record<string, { includes: string[]; extra: { file: string; label: string }[] }> = {
  "kit-financeiro-empresarial": {
    includes: [
      "planilha-fluxo-de-caixa-empresarial",
      "planilha-dre-gerencial",
      "planilha-de-precificacao",
      "dashboard-financeiro-gerencial",
    ],
    extra: [
      {
        file: "manual-de-implantacao-kit-financeiro-empresarial.pdf",
        label: "Manual de implantação integrada (PDF)",
      },
    ],
  },
  "kit-gestao-empresarial": {
    includes: [
      "modelo-de-planejamento-estrategico",
      "plano-de-negocios-enxuto",
      "planilha-dre-gerencial",
    ],
    extra: [
      { file: "rotina-de-reunioes-de-gestao.pdf", label: "Rotina de reuniões de gestão (PDF)" },
    ],
  },
};

function entriesFor(slug: string): { file: string; label: string }[] {
  const kit = KITS[slug];
  if (kit) return [...kit.includes.flatMap((s) => MANIFEST[s] ?? []), ...kit.extra];
  return MANIFEST[slug] ?? [];
}

function sizeOf(file: string) {
  const b64 = files[file];
  return b64
    ? Math.floor((b64.length * 3) / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0)
    : 0;
}

/** Files a product delivers, for listing in the customer's library. */
export function listDeliverables(slug: string): DeliverableFile[] {
  return entriesFor(slug)
    .filter((e) => files[e.file])
    .map((e) => ({ name: e.file, label: e.label, size: sizeOf(e.file) }));
}

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  md: "text/markdown; charset=utf-8",
};

/** The file's content, only if it belongs to the given product; otherwise null. */
export function readDeliverable(
  slug: string,
  file: string,
): { name: string; mimeType: string; base64: string } | null {
  if (!entriesFor(slug).some((e) => e.file === file)) return null;
  const base64 = files[file];
  if (!base64) return null;
  const ext = file.split(".").pop() ?? "";
  return { name: file, mimeType: MIME[ext] ?? "application/octet-stream", base64 };
}
