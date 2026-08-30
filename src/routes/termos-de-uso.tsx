import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/termos-de-uso")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Vértice" },
      {
        name: "description",
        content: "Regras de compra, licença de uso e entrega digital dos produtos Vértice.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/termos-de-uso" }],
  }),
  component: TermsOfUse,
});

function TermsOfUse() {
  return (
    <>
      <section className="band-dark border-b border-border">
        <div className="container-editorial pt-40 pb-16 lg:pt-48 lg:pb-20">
          <p className="label-micro text-primary">Legal</p>
          <h1 className="display-hero mt-8">Termos de Uso</h1>
          <p className="mt-6 text-sm text-muted-foreground">Última atualização: 25 de agosto de 2026</p>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial max-w-3xl space-y-12 py-20 lg:py-28">
          <p className="border border-border p-6 text-sm leading-relaxed text-muted-foreground">
            Este texto é um modelo inicial. Antes de publicar o site, substitua os campos entre
            colchetes pelos dados reais da empresa e peça a revisão de um advogado.
          </p>

          <div>
            <h2 className="display-section text-2xl">1. Aceitação</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Ao criar uma conta ou comprar na Vértice ([RAZÃO SOCIAL], CNPJ [CNPJ]), você concorda
              com estes termos e com a nossa Política de Privacidade.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">2. O que vendemos</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A Vértice vende produtos digitais de autoria própria — e-books, planilhas, templates,
              checklists e kits — entregues por download imediato após a confirmação do pagamento.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">3. Licença de uso</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Ao comprar um produto, você recebe uma licença pessoal e intransferível de uso. É
              proibido revender, redistribuir, compartilhar publicamente ou publicar os arquivos
              adquiridos, no todo ou em parte, sem autorização por escrito da Vértice.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">4. Pagamento e preços</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Os preços exibidos incluem todos os tributos aplicáveis. O pagamento é processado por
              um provedor externo especializado; a Vértice não armazena dados completos de cartão.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">5. Direito de arrependimento</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Conforme o artigo 49 do Código de Defesa do Consumidor, você tem até 7 dias corridos
              após a compra para desistir e solicitar reembolso integral, desde que ainda não tenha
              baixado ou acessado os arquivos do produto. Após o download, o direito de
              arrependimento deixa de se aplicar, dada a natureza digital do produto.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">6. Propriedade intelectual</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Todo o conteúdo do site e dos produtos — textos, planilhas, layouts, marca e logotipo —
              pertence à Vértice ou a seus licenciadores e é protegido por lei de direitos autorais.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">7. Limitação de responsabilidade</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Os produtos são ferramentas de apoio à gestão e não substituem aconselhamento
              contábil, jurídico ou financeiro profissional. A Vértice não se responsabiliza por
              decisões de negócio tomadas com base no conteúdo adquirido.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">8. Alterações destes termos</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Podemos atualizar estes termos periodicamente. A data no topo desta página indica a
              versão mais recente.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">9. Legislação e foro</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de
              [CIDADE/UF] para dirimir eventuais controvérsias.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
