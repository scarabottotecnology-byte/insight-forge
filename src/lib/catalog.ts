import mockupDashboard from "@/assets/mockup-dashboard.jpg";
import mockupEbook from "@/assets/mockup-ebook.jpg";
import mockupKit from "@/assets/mockup-kit.jpg";

export type ProductType =
  | "Planilha"
  | "Dashboard"
  | "E-book"
  | "Template"
  | "Documento"
  | "Checklist"
  | "Kit";

export type ProductTier = "free" | "entry" | "core" | "premium" | "bundle";

export type Product = {
  slug: string;
  name: string;
  category: string;
  type: ProductType;
  tier: ProductTier;
  level: "Essencial" | "Intermediário" | "Avançado";
  price: number;
  compareAt?: number;
  badge?: string;
  tagline: string;
  problem: string;
  solution: string;
  includes: string[];
  benefits: string[];
  specs: { label: string; value: string }[];
  audience: string[];
  faq: { q: string; a: string }[];
  bundleOf?: string[];
  image: string;
  featured?: boolean;
  bestSeller?: boolean;
};

export const categories = [
  { slug: "financas", name: "Finanças", note: "Caixa, DRE, orçamento, precificação" },
  { slug: "gestao", name: "Gestão", note: "Rotinas, indicadores, controle" },
  { slug: "estrategia", name: "Estratégia", note: "Planejamento e decisão" },
  { slug: "empreendedorismo", name: "Empreendedorismo", note: "Abertura e estruturação" },
  { slug: "controladoria", name: "Controladoria", note: "Custos e análise gerencial" },
  { slug: "produtividade", name: "Produtividade", note: "Método e execução" },
];

const money = (v: number) => v;

export const products: Product[] = [
  {
    slug: "planilha-fluxo-de-caixa-empresarial",
    name: "Planilha de Fluxo de Caixa Empresarial",
    category: "Finanças",
    type: "Planilha",
    tier: "core",
    level: "Intermediário",
    price: money(89),
    compareAt: 129,
    badge: "Mais vendido",
    bestSeller: true,
    image: mockupKit,
    tagline: "Controle diário, semanal e mensal do caixa com projeção de 12 meses.",
    problem:
      "A maioria das empresas descobre um problema de caixa quando ele já aconteceu. Lançamentos dispersos, previsões no improviso e nenhuma visão de curto prazo.",
    solution:
      "Uma estrutura única de lançamentos que alimenta automaticamente posição atual, projeção futura e alertas de saldo mínimo.",
    includes: [
      "Planilha principal em Excel (.xlsx) com abas de entrada, saída e projeção",
      "Painel de indicadores com saldo, burn e cobertura em dias",
      "Plano de contas gerencial pré-configurado e editável",
      "Manual de implantação em PDF (14 páginas)",
    ],
    benefits: [
      "Previsão de caixa para os próximos 12 meses",
      "Identificação antecipada de gargalos de liquidez",
      "Base pronta para conversas com banco e investidor",
    ],
    specs: [
      { label: "Formato", value: "Excel (.xlsx) + PDF" },
      { label: "Compatibilidade", value: "Excel 2016+, Google Sheets" },
      { label: "Fórmulas", value: "Desbloqueadas e documentadas" },
      { label: "Atualizações", value: "Vitalícias" },
    ],
    audience: [
      "Pequenas e médias empresas sem controle formal de caixa",
      "Controllers e analistas financeiros",
      "Fundadores que gerenciam o financeiro diretamente",
    ],
    faq: [
      { q: "Funciona no Google Sheets?", a: "Sim. Todas as fórmulas são compatíveis; recomendamos o Excel para os painéis." },
      { q: "Posso adaptar o plano de contas?", a: "Sim, a estrutura é editável e não há células protegidas por senha." },
      { q: "Como recebo o arquivo?", a: "O acesso é liberado imediatamente após a compra, na sua área de downloads." },
    ],
  },
  {
    slug: "dashboard-financeiro-gerencial",
    name: "Dashboard Financeiro Gerencial",
    category: "Controladoria",
    type: "Dashboard",
    tier: "premium",
    level: "Avançado",
    price: money(219),
    badge: "Premium",
    featured: true,
    image: mockupDashboard,
    tagline: "Um painel executivo que traduz números contábeis em decisões.",
    problem:
      "Relatórios longos que ninguém lê. A diretoria precisa de leitura imediata, não de exportações brutas do sistema.",
    solution:
      "Um dashboard com camada de dados separada da camada de visualização, indicadores calculados e leitura executiva em uma tela.",
    includes: [
      "Arquivo Excel com modelo de dados e 4 painéis (Resultado, Caixa, Margem, Estrutura)",
      "Biblioteca de 32 indicadores com memória de cálculo",
      "Guia de integração com exportações de ERP",
      "Versão de apresentação para reuniões mensais",
    ],
    benefits: [
      "Reunião mensal de resultado em uma única tela",
      "Comparativo real, orçado e ano anterior",
      "Padronização da leitura financeira entre áreas",
    ],
    specs: [
      { label: "Formato", value: "Excel (.xlsx) + PDF" },
      { label: "Indicadores", value: "32 métricas documentadas" },
      { label: "Integração", value: "CSV / exportação de ERP" },
      { label: "Nível", value: "Avançado" },
    ],
    audience: ["Controladoria", "CFOs e gerentes financeiros", "Consultorias de gestão"],
    faq: [
      { q: "Preciso saber Power Query?", a: "Não é obrigatório. O guia cobre o processo manual e o automatizado." },
      { q: "Serve para múltiplas empresas?", a: "Sim, a estrutura suporta consolidação por unidade de negócio." },
    ],
  },
  {
    slug: "planilha-dre-gerencial",
    name: "Planilha de DRE Gerencial",
    category: "Controladoria",
    type: "Planilha",
    tier: "core",
    level: "Intermediário",
    price: money(79),
    bestSeller: true,
    image: mockupKit,
    tagline: "Resultado por centro de custo, margem de contribuição e ponto de equilíbrio.",
    problem: "A DRE contábil chega tarde e não responde perguntas de gestão.",
    solution: "Uma DRE gerencial mensal, comparável e com abertura por centro de custo e linha de receita.",
    includes: [
      "DRE gerencial mensal e acumulada",
      "Margem de contribuição por produto e canal",
      "Cálculo de ponto de equilíbrio",
      "Manual de classificação de custos",
    ],
    benefits: ["Visão real de rentabilidade", "Custos fixos e variáveis separados", "Comparativo de 24 meses"],
    specs: [
      { label: "Formato", value: "Excel (.xlsx)" },
      { label: "Períodos", value: "24 meses" },
      { label: "Atualizações", value: "Vitalícias" },
    ],
    audience: ["Controladoria", "Gestores de operação", "Contadores gerenciais"],
    faq: [{ q: "Substitui a contabilidade?", a: "Não. É uma camada gerencial que complementa a contábil." }],
  },
  {
    slug: "modelo-de-business-plan",
    name: "Modelo de Business Plan",
    category: "Estratégia",
    type: "Documento",
    tier: "core",
    level: "Intermediário",
    price: money(119),
    compareAt: 159,
    image: mockupEbook,
    tagline: "Estrutura completa de plano de negócios com modelo financeiro acoplado.",
    problem: "Planos de negócio bonitos sem números sustentáveis — ou números soltos sem narrativa.",
    solution: "Documento estruturado em 9 blocos, com planilha de projeções conectada às premissas do texto.",
    includes: [
      "Documento editável (.docx) com 9 blocos e orientações por seção",
      "Modelo financeiro de 5 anos em Excel",
      "Apresentação executiva (.pptx) de 14 slides",
      "Checklist de premissas e validação",
    ],
    benefits: ["Narrativa e números alinhados", "Pronto para banco, edital e investidor", "Reduz semanas de trabalho"],
    specs: [
      { label: "Formato", value: "DOCX + XLSX + PPTX" },
      { label: "Projeção", value: "5 anos" },
      { label: "Idioma", value: "Português (BR)" },
    ],
    audience: ["Fundadores em captação", "Consultores", "Times de novos negócios"],
    faq: [{ q: "Serve para qualquer setor?", a: "Sim, as premissas são parametrizáveis por modelo de receita." }],
  },
  {
    slug: "planilha-de-precificacao",
    name: "Planilha de Precificação",
    category: "Finanças",
    type: "Planilha",
    tier: "entry",
    level: "Essencial",
    price: money(39),
    image: mockupKit,
    tagline: "Preço construído a partir de custo, imposto, margem e canal.",
    problem: "Preço definido por comparação com o concorrente costuma destruir margem silenciosamente.",
    solution: "Um modelo que parte do custo real e mostra o impacto de cada variável na margem final.",
    includes: [
      "Modelo de precificação para produto e serviço",
      "Simulador de markup e margem",
      "Cálculo de impostos por regime",
      "Guia rápido de aplicação",
    ],
    benefits: ["Margem visível por item", "Simulação de cenários", "Decisão de desconto com critério"],
    specs: [
      { label: "Formato", value: "Excel (.xlsx)" },
      { label: "Regimes", value: "Simples, Presumido, Real" },
    ],
    audience: ["Comércio e serviços", "Times commerciais", "Empreendedores individuais"],
    faq: [{ q: "Inclui impostos atualizados?", a: "As alíquotas são parametrizáveis e devem ser conferidas com seu contador." }],
  },
  {
    slug: "kit-financeiro-empresarial",
    name: "Kit Financeiro Empresarial",
    category: "Finanças",
    type: "Kit",
    tier: "bundle",
    level: "Avançado",
    price: money(349),
    compareAt: 506,
    badge: "Kit",
    featured: true,
    image: mockupKit,
    bundleOf: [
      "planilha-fluxo-de-caixa-empresarial",
      "planilha-dre-gerencial",
      "planilha-de-precificacao",
      "dashboard-financeiro-gerencial",
    ],
    tagline: "A estrutura financeira completa da empresa em um único conjunto.",
    problem: "Ferramentas isoladas geram retrabalho: cada planilha com um plano de contas diferente.",
    solution: "Quatro instrumentos com a mesma base de classificação, pensados para operar em conjunto.",
    includes: [
      "Planilha de Fluxo de Caixa Empresarial",
      "Planilha de DRE Gerencial",
      "Planilha de Precificação",
      "Dashboard Financeiro Gerencial",
      "Manual de implantação integrada",
    ],
    benefits: ["Plano de contas único", "Implantação em sequência guiada", "Economia sobre a compra individual"],
    specs: [
      { label: "Itens", value: "4 ferramentas + manual" },
      { label: "Formato", value: "XLSX + PDF" },
      { label: "Atualizações", value: "Vitalícias" },
    ],
    audience: ["Empresas estruturando o financeiro", "Consultorias", "Controladoria enxuta"],
    faq: [{ q: "Posso começar por uma parte?", a: "Sim. O manual sugere uma ordem de implantação em quatro etapas." }],
  },
  {
    slug: "plano-de-negocios-enxuto",
    name: "Plano de Negócios Enxuto",
    category: "Empreendedorismo",
    type: "Template",
    tier: "entry",
    level: "Essencial",
    price: money(29),
    image: mockupEbook,
    tagline: "Uma página para validar o modelo antes de escrever o plano completo.",
    problem: "Escrever 40 páginas antes de testar a hipótese principal é caro.",
    solution: "Um canvas de decisão com as nove perguntas que determinam a viabilidade inicial.",
    includes: ["Canvas editável (.docx e .pdf)", "Guia de preenchimento", "Checklist de validação"],
    benefits: ["Clareza em uma página", "Validação antes do investimento", "Base para o plano completo"],
    specs: [
      { label: "Formato", value: "DOCX + PDF" },
      { label: "Tempo de uso", value: "Cerca de 90 minutos" },
    ],
    audience: ["Quem está no início", "Times de inovação"],
    faq: [{ q: "É o mesmo que o Business Plan?", a: "Não. É a etapa anterior, mais curta e voltada à validação." }],
  },
  {
    slug: "checklist-abertura-de-empresa",
    name: "Checklist de Abertura de Empresa",
    category: "Empreendedorismo",
    type: "Checklist",
    tier: "free",
    level: "Essencial",
    price: money(0),
    badge: "Gratuito",
    image: mockupEbook,
    tagline: "As 48 etapas entre a decisão e a primeira nota fiscal emitida.",
    problem: "Abrir empresa envolve decisões societárias, fiscais e operacionais fora de ordem.",
    solution: "Uma sequência verificável de 48 etapas, agrupadas em cinco frentes.",
    includes: ["Checklist em PDF interativo", "Versão editável em planilha"],
    benefits: ["Nada esquecido no caminho", "Decisões na ordem correta", "Acesso imediato"],
    specs: [
      { label: "Formato", value: "PDF + XLSX" },
      { label: "Etapas", value: "48" },
    ],
    audience: ["Novos empreendedores", "Contadores e assessorias"],
    faq: [{ q: "É realmente gratuito?", a: "Sim. Pedimos apenas o e-mail para enviar o acesso e as atualizações." }],
  },
  {
    slug: "modelo-de-planejamento-estrategico",
    name: "Modelo de Planejamento Estratégico",
    category: "Estratégia",
    type: "Template",
    tier: "core",
    level: "Avançado",
    price: money(139),
    image: mockupEbook,
    tagline: "Do diagnóstico ao desdobramento em metas trimestrais.",
    problem: "Planejamentos anuais que morrem em fevereiro por falta de desdobramento.",
    solution: "Um método em quatro etapas que conecta diagnóstico, objetivos, iniciativas e rotina de acompanhamento.",
    includes: [
      "Documento de planejamento (.docx)",
      "Planilha de desdobramento de metas e iniciativas",
      "Apresentação de alinhamento (.pptx)",
      "Rotina de acompanhamento trimestral",
    ],
    benefits: ["Estratégia com dono e prazo", "Ritual de revisão definido", "Alinhamento entre áreas"],
    specs: [
      { label: "Formato", value: "DOCX + XLSX + PPTX" },
      { label: "Ciclo", value: "Anual com revisão trimestral" },
    ],
    audience: ["Diretoria", "Gestores de área", "Consultorias de estratégia"],
    faq: [{ q: "Usa OKR?", a: "A estrutura é compatível com OKR, mas não obriga o formato." }],
  },
  {
    slug: "kit-gestao-empresarial",
    name: "Kit de Gestão Empresarial",
    category: "Gestão",
    type: "Kit",
    tier: "bundle",
    level: "Intermediário",
    price: money(279),
    compareAt: 386,
    badge: "Kit",
    image: mockupKit,
    bundleOf: ["modelo-de-planejamento-estrategico", "plano-de-negocios-enxuto", "planilha-dre-gerencial"],
    tagline: "Planejamento, indicadores e rotina de gestão em um conjunto coerente.",
    problem: "Gestão feita por reuniões sem indicador e por indicadores sem rotina.",
    solution: "Três instrumentos que formam o ciclo completo: planejar, medir, revisar.",
    includes: [
      "Modelo de Planejamento Estratégico",
      "Plano de Negócios Enxuto",
      "Planilha de DRE Gerencial",
      "Rotina de reuniões de gestão",
    ],
    benefits: ["Ciclo de gestão fechado", "Documentos padronizados", "Economia sobre itens separados"],
    specs: [
      { label: "Itens", value: "3 ferramentas + rotina" },
      { label: "Formato", value: "DOCX + XLSX + PPTX" },
    ],
    audience: ["PMEs em estruturação", "Gestores de operação"],
    faq: [{ q: "Há sobreposição com o Kit Financeiro?", a: "Apenas a DRE Gerencial é comum aos dois conjuntos." }],
  },
  {
    slug: "ebook-gestao-financeira-na-pratica",
    name: "Gestão Financeira na Prática",
    category: "Finanças",
    type: "E-book",
    tier: "entry",
    level: "Essencial",
    price: money(35),
    image: mockupEbook,
    tagline: "O manual de leitura financeira para quem decide, não para quem lança.",
    problem: "Termos financeiros usados sem entendimento levam a decisões erradas com boa intenção.",
    solution: "Um e-book direto sobre caixa, resultado, margem e capital de giro, com exemplos numéricos.",
    includes: ["E-book em PDF (118 páginas)", "Versão EPUB", "Planilha de exemplos do livro"],
    benefits: ["Vocabulário financeiro dominado", "Leitura de relatórios com autonomia", "Exemplos aplicáveis"],
    specs: [
      { label: "Formato", value: "PDF + EPUB" },
      { label: "Páginas", value: "118" },
    ],
    audience: ["Gestores não financeiros", "Empreendedores", "Times comerciais"],
    faq: [{ q: "Tem exercícios?", a: "Sim, com planilha de apoio e gabarito." }],
  },
  {
    slug: "planilha-orcamento-empresarial",
    name: "Planilha de Orçamento Empresarial",
    category: "Gestão",
    type: "Planilha",
    tier: "core",
    level: "Intermediário",
    price: money(99),
    image: mockupKit,
    tagline: "Orçamento anual por área, com acompanhamento de realizado versus previsto.",
    problem: "Orçamento aprovado em planilha que ninguém revisita depois de janeiro.",
    solution: "Estrutura por centro de custo com acompanhamento mensal e variação automática.",
    includes: [
      "Orçamento anual por centro de custo",
      "Acompanhamento realizado x orçado",
      "Relatório de variações",
      "Guia do ciclo orçamentário",
    ],
    benefits: ["Responsabilidade por área", "Variação visível cedo", "Base para o próximo ciclo"],
    specs: [
      { label: "Formato", value: "Excel (.xlsx)" },
      { label: "Ciclo", value: "12 meses" },
    ],
    audience: ["Controladoria", "Gestores de centro de custo"],
    faq: [{ q: "Integra com o fluxo de caixa?", a: "Sim, compartilha o mesmo plano de contas gerencial." }],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const brl = (v: number) =>
  v === 0 ? "Gratuito" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Posts live in Firestore now — see scripts/seed-posts.mjs and src/lib/firestore-schema.ts.
