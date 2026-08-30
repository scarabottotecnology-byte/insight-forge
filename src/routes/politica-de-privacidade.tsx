import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Vértice" },
      {
        name: "description",
        content: "Como a Vértice coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/politica-de-privacidade" }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <>
      <section className="band-dark border-b border-border">
        <div className="container-editorial pt-40 pb-16 lg:pt-48 lg:pb-20">
          <p className="label-micro text-primary">Legal</p>
          <h1 className="display-hero mt-8">Política de Privacidade</h1>
          <p className="mt-6 text-sm text-muted-foreground">Última atualização: 25 de agosto de 2026</p>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial max-w-3xl space-y-12 py-20 lg:py-28">
          <p className="border border-border p-6 text-sm leading-relaxed text-muted-foreground">
            Este texto é um modelo inicial, escrito para se adequar à Lei Geral de Proteção de Dados
            (LGPD — Lei 13.709/2018). Antes de publicar o site, substitua os campos entre colchetes
            pelos dados reais da empresa e peça a revisão de um advogado.
          </p>

          <div>
            <h2 className="display-section text-2xl">1. Quem somos</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A Vértice ([RAZÃO SOCIAL], CNPJ [CNPJ]) é a controladora dos dados pessoais tratados
              nesta plataforma. Dúvidas sobre privacidade podem ser enviadas para{" "}
              <span className="text-foreground">privacidade@vertice.com.br</span>.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">2. Quais dados coletamos</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Dados de cadastro: nome, e-mail e senha (armazenada de forma criptografada).</li>
              <li>Dados de compra: produtos adquiridos, valor, forma de pagamento e status do pedido.</li>
              <li>Dados de navegação: páginas visitadas e interações no site, via cookies.</li>
            </ul>
          </div>

          <div>
            <h2 className="display-section text-2xl">3. Para que usamos seus dados</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Processar compras e liberar o acesso aos produtos digitais adquiridos.</li>
              <li>Enviar e-mails transacionais (confirmação de compra, recuperação de senha).</li>
              <li>Prevenir fraude e proteger a segurança da conta.</li>
              <li>Com seu consentimento, enviar comunicações de marketing e newsletter.</li>
            </ul>
          </div>

          <div>
            <h2 className="display-section text-2xl">4. Com quem compartilhamos</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Usamos fornecedores que tratam dados em nosso nome (operadores), como o Google Firebase
              (autenticação, banco de dados e armazenamento de arquivos) e, quando o pagamento estiver
              ativo, o processador de pagamento escolhido. Não vendemos dados pessoais a terceiros.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">5. Por quanto tempo guardamos</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Mantemos os dados de conta e pedidos enquanto sua conta estiver ativa e pelo prazo
              exigido por lei fiscal e consumerista. Você pode pedir a exclusão a qualquer momento,
              respeitados os registros que a lei nos obriga a manter.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">6. Seus direitos</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Nos termos do artigo 18 da LGPD, você pode solicitar: confirmação do tratamento, acesso
              aos dados, correção, anonimização ou eliminação de dados desnecessários, portabilidade,
              informação sobre compartilhamento e revogação do consentimento. Basta escrever para{" "}
              <span className="text-foreground">privacidade@vertice.com.br</span>.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">7. Cookies</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Usamos cookies essenciais (login, carrinho) e, mediante seu consentimento, cookies de
              análise de audiência. Você pode gerenciar sua preferência a qualquer momento pelo aviso
              de cookies exibido no rodapé do site.
            </p>
          </div>

          <div>
            <h2 className="display-section text-2xl">8. Alterações desta política</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Podemos atualizar esta política periodicamente. A data no topo desta página indica a
              versão mais recente.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
