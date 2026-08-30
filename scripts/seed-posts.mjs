import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const posts = [
  {
    slug: "orcamento-empresarial",
    kicker: "Finanças",
    title: "Como construir um orçamento empresarial que sobrevive ao ano",
    excerpt:
      "Um orçamento não é uma previsão: é um contrato interno. O que muda quando cada linha tem um responsável.",
    related: "planilha-orcamento-empresarial",
    readTime: "8 min",
    sections: [
      {
        heading: "O erro mais comum",
        paragraphs: [
          "A maioria dos orçamentos empresariais nasce em dezembro e morre em fevereiro. Alguém monta uma planilha ambiciosa, a diretoria aprova em uma reunião de uma hora, e depois ninguém mais abre o arquivo até o ano seguinte — quando o processo se repete do zero, sem aprender nada com o que aconteceu.",
          "O problema não é a falta de disciplina. É tratar o orçamento como uma peça de comunicação em vez de uma ferramenta de gestão. Um documento feito para impressionar investidores ou sócios raramente sobrevive ao contato com a realidade operacional.",
        ],
      },
      {
        heading: "Um orçamento é um contrato interno",
        paragraphs: [
          "A diferença entre um orçamento que funciona e um que vira peça de arquivo está numa palavra: responsabilidade. Cada linha do orçamento precisa ter um dono — uma pessoa ou área que responde por aquele número, entende de onde ele vem e é cobrada quando ele se desvia.",
          "Isso muda a natureza do documento. Deixa de ser uma previsão genérica da empresa como um todo e passa a ser uma soma de compromissos específicos: o comercial se compromete com uma meta de receita, operações se compromete com um teto de custo variável, RH se compromete com um limite de folha. O orçamento consolidado é a soma desses contratos, não uma estimativa isolada da diretoria financeira.",
        ],
      },
      {
        heading: "A estrutura mínima que funciona",
        paragraphs: [
          "Não é preciso um modelo sofisticado para começar bem. O essencial é separar três blocos com lógicas diferentes: receita (com premissas explícitas de volume e preço, não só um número final), custos fixos (previsíveis, quase contratuais) e custos variáveis (que devem escalar com a receita, não ficar soltos).",
          "Um quarto bloco, frequentemente esquecido, é a reserva de contingência — uma margem deliberada para o imprevisto. Orçamentos sem folga quebram no primeiro mês ruim, porque qualquer desvio já nasce sem espaço de manobra.",
        ],
      },
      {
        heading: "Revisão mensal, não anual",
        paragraphs: [
          "Orçamento estático é orçamento morto. O valor real do exercício está na comparação mensal entre orçado e realizado, com uma pergunta simples para cada desvio relevante: isso foi um problema de premissa (a expectativa estava errada) ou um problema de execução (a expectativa estava certa, mas não foi cumprida)?",
          "Essa distinção muda a ação seguinte. Desvio de premissa pede ajuste do orçamento para o resto do ano. Desvio de execução pede correção de rota na operação. Confundir os dois é a razão pela qual muitas empresas revisam o orçamento tarde demais — ou não revisam nunca.",
        ],
      },
      {
        heading: "Da teoria à planilha",
        paragraphs: [
          "Na prática, isso significa ter uma estrutura que force a separação por responsável, premissas explícitas de receita e um comparativo orçado-vs-realizado atualizado mês a mês — não uma tabela estática entregue em janeiro. É exatamente essa estrutura que a Planilha de Orçamento Empresarial do catálogo Vértice já traz pronta, com as fórmulas de desvio e os campos de responsável já configurados.",
        ],
      },
    ],
  },
  {
    slug: "leitura-de-margem",
    kicker: "Controladoria",
    title: "Margem de contribuição: o indicador que corrige decisões de preço",
    excerpt:
      "Faturar mais e ganhar menos é comum. A margem de contribuição explica onde o resultado se perde.",
    related: "planilha-dre-gerencial",
    readTime: "6 min",
    sections: [
      {
        heading: "O paradoxo de faturar mais e ganhar menos",
        paragraphs: [
          "É um padrão recorrente: a receita cresce trimestre após trimestre, a equipe comemora, e o resultado líquido no fim do ano decepciona. A explicação, na maioria dos casos, não está em uma única causa dramática — está no mix de produtos ou serviços vendidos ter mudado para itens com margem pior, sem ninguém perceber em tempo real.",
          "Faturamento é uma métrica de volume. Resultado é uma métrica de eficiência. Uma empresa pode crescer em volume e encolher em eficiência ao mesmo tempo, e o único jeito de enxergar isso é olhando margem por produto, não só o total.",
        ],
      },
      {
        heading: "O que é margem de contribuição, de fato",
        paragraphs: [
          "Margem de contribuição é o que sobra do preço de venda depois de descontar apenas os custos variáveis daquele item — matéria-prima, comissão, taxa de cartão, frete. É o valor que cada venda efetivamente contribui para cobrir os custos fixos da empresa e, depois disso, gerar lucro.",
          "Isso é diferente de margem bruta contábil e diferente de markup. Markup é calculado sobre o custo; margem de contribuição é sobre o preço de venda, e é ela que responde à pergunta que realmente importa na hora de decidir um desconto: 'quanto dessa venda ainda sobra para a empresa depois de pagar o que essa venda especificamente exigiu?'",
        ],
      },
      {
        heading: "Por que markup uniforme é perigoso",
        paragraphs: [
          "Aplicar o mesmo percentual de markup para todo o catálogo é operacionalmente simples e financeiramente ingênuo. Produtos com estrutura de custo variável diferente acabam com margens de contribuição muito distintas, mesmo com o mesmo markup nominal — e o vendedor, sem essa informação, empurra descontos igualmente em itens que toleram e itens que não toleram.",
          "O resultado é previsível: o mix de vendas migra, sem intenção, para os produtos que o cliente mais pede desconto — que costumam ser justamente os de margem mais apertada.",
        ],
      },
      {
        heading: "Ponto de equilíbrio e a hora certa de dizer não a um desconto",
        paragraphs: [
          "Conhecer a margem de contribuição de cada produto permite calcular o ponto de equilíbrio real da operação e, mais importante no dia a dia, estabelecer um piso de desconto defensável. Um vendedor com essa informação em mãos consegue negociar com um limite objetivo, em vez de um 'até onde o cliente aceitar'.",
          "Isso também expõe produtos que, mesmo vendendo bem, deveriam ser repensados — descontinuados, reprecificados ou reposicionados como isca para vender algo de margem melhor junto.",
        ],
      },
      {
        heading: "Onde essa leitura aparece na prática",
        paragraphs: [
          "Esse tipo de leitura por produto só é possível quando a DRE está estruturada por margem de contribuição, não apenas por natureza de despesa. É exatamente essa estrutura — DRE gerencial com margem por linha de produto e ponto de equilíbrio calculado automaticamente — que está pronta na Planilha de DRE Gerencial do catálogo Vértice.",
        ],
      },
    ],
  },
  {
    slug: "caixa-versus-resultado",
    kicker: "Gestão",
    title: "Caixa e resultado não são a mesma coisa — e a diferença custa caro",
    excerpt: "Empresas lucrativas quebram por liquidez. Como acompanhar as duas dimensões em paralelo.",
    related: "planilha-fluxo-de-caixa-empresarial",
    readTime: "7 min",
    sections: [
      {
        heading: "A empresa lucrativa que não conseguiu pagar as contas",
        paragraphs: [
          "Uma das situações mais desorientadoras para quem gere uma empresa é fechar o mês com lucro na DRE e, na mesma semana, não ter caixa suficiente para pagar um fornecedor. Não é contradição — é a diferença entre dois regimes contábeis distintos, e quem não entende a diferença toma decisões erradas exatamente nos momentos mais críticos.",
          "O resultado (DRE) segue o regime de competência: reconhece receitas e despesas quando o fato gerador ocorre, não quando o dinheiro efetivamente entra ou sai. O caixa segue o regime, bem, de caixa: só existe o que já foi recebido ou pago de fato.",
        ],
      },
      {
        heading: "Para onde o lucro 'some'",
        paragraphs: [
          "Três lugares concentram a maior parte da diferença entre lucro contábil e caixa disponível. Primeiro, prazo de recebimento: uma venda a prazo de 60 dias já é receita reconhecida hoje, mas só vira caixa daqui a dois meses. Segundo, estoque: comprar mercadoria consome caixa imediatamente, mas só vira custo (e afeta o resultado) quando é efetivamente vendida. Terceiro, investimentos e amortizações de dívida: saem do caixa integralmente no momento do desembolso, mas entram na DRE de forma diluída ao longo do tempo, ou nem entram.",
          "Empresas em crescimento acelerado sentem isso com mais intensidade: cada novo cliente a prazo e cada reposição de estoque consome caixa antes de gerar qualquer retorno contábil. Crescer rápido, paradoxalmente, é uma das formas mais comuns de quebrar por falta de caixa mesmo sendo lucrativo no papel.",
        ],
      },
      {
        heading: "Acompanhar as duas dimensões em paralelo",
        paragraphs: [
          "A prática que resolve isso não é escolher entre DRE e fluxo de caixa — é manter os dois lado a lado, com a mesma régua de tempo, e entender conscientemente a ponte entre eles: quanto do resultado do mês já virou caixa, e quanto ainda está 'preso' em recebíveis ou estoque.",
          "Isso exige um fluxo de caixa projetado, não apenas histórico. Um extrato bancário mostra o passado; uma gestão de caixa séria projeta as próximas semanas com base em recebíveis e compromissos já assumidos, para identificar um aperto de liquidez com antecedência suficiente para agir — negociar prazo, antecipar recebíveis ou segurar uma compra.",
        ],
      },
      {
        heading: "Os sinais de alerta que costumam ser ignorados",
        paragraphs: [
          "Três sinais merecem atenção antes de virarem crise: o prazo médio de recebimento crescendo mês a mês, o saldo de caixa caindo enquanto a receita sobe, e a dependência de linhas de crédito de curto prazo para cobrir operação recorrente — não um imprevisto pontual, mas o dia a dia.",
          "Qualquer um desses sinais, isolado, pode ter explicação razoável. Os três juntos, de forma persistente, indicam que o crescimento está sendo financiado por um aperto de caixa que vai cobrar a conta em algum momento.",
        ],
      },
      {
        heading: "A ferramenta para essa leitura",
        paragraphs: [
          "Separar e projetar essas duas dimensões — resultado e caixa — exige uma estrutura própria, com entradas e saídas classificadas por natureza e uma projeção rolante das próximas semanas. É essa estrutura que está pronta na Planilha de Fluxo de Caixa Empresarial do catálogo Vértice.",
        ],
      },
    ],
  },
];

async function main() {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const app = initializeApp({ credential: cert(sa) });
  const db = getFirestore(app);

  const now = Date.now();
  const batch = db.batch();
  for (const post of posts) {
    const ref = db.collection("posts").doc(post.slug);
    batch.set(ref, { ...post, createdAt: now, updatedAt: now });
  }
  await batch.commit();
  console.log(`Seeded ${posts.length} posts.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
