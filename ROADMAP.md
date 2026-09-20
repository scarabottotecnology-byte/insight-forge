# Vértice Business Tools — Roadmap & Backlog

Legenda de status: ✅ concluído · 🔶 parcial/infra pronta · ⬜ não iniciado · 🔄 substituído por decisão de produto
Legenda de prioridade: **P0** crítico · **P1** alto · **P2** médio · **P3** desejável
Estimativa em pontos (1 = ~meio dia).

> **Nota de arquitetura (2026-08-23):** o backend saiu do plano original (Lovable Cloud /
> Postgres/RLS) e migrou para **Firebase** (Auth, Firestore, Storage). Os itens de Fase 1
> abaixo foram reescritos para refletir isso — regras em `firestore.rules`, tipos em
> `src/lib/firestore-schema.ts`, wiring em `src/lib/firebase.ts` / `firebase-admin.ts`.

> **Nota de decisão de produto (2026-09-19):** por causa do tempo que a Fase 2 (checkout
> Asaas próprio + entrega via Storage) estava levando para ficar pronta ponta a ponta, o
> checkout e a entrega dos produtos passam a ser feitos pela **Kiwify**; o site vira
> vitrine/landing page. O carrinho e a integração Asaas continuam no repositório
> (`src/lib/cart.tsx`, `src/lib/asaas.server.ts`, `src/routes/api.webhooks.asaas.ts`),
> só desativados da navegação — decisão explícita de não remover ainda, pra poder reverter
> fácil. `Product.kiwifyUrl` (novo campo) e os botões de compra em `produtos.$slug.tsx` já
> estão prontos para o link de checkout da Kiwify (ver Fase 2B). Isso torna boa parte da
> Fase 2, e o histórico de pedidos de Fase 3/5, não-prioritários por ora — marcados 🔄
> abaixo, sem apagar o que já foi feito.

---

## Fase 0 — Fundação (concluído)

| # | Issue | Status |
|---|---|---|
| V-001 | Naming, identidade e logo VÉRTICE | ✅ |
| V-002 | Design system (tokens oklch, tipografia, utilitários editoriais) | ✅ |
| V-003 | Header/Footer, navegação e rotas base | ✅ |
| V-004 | Catálogo estático (12 produtos) + filtros | ✅ |
| V-005 | Página de produto (landing) com FAQ e cross-sell | ✅ |
| V-006 | Carrinho com persistência local e cupom | ✅ |
| V-007 | Área do cliente (estrutura) e Insights | ✅ |
| V-008 | SEO por rota (head, canonical, OG, JSON-LD) | ✅ |
| V-009 | Efeitos de rolagem: progress bar, parallax, marquee | ✅ |

---

## Fase 1 — Backend e Contas (P0)

| # | Issue | Status | Prioridade | Est. | Nota |
|---|---|---|---|---|---|
| V-101 | Ativar Firebase (Auth, Firestore, Storage) | ✅ | P0 | 1 | `firebase.ts`, `firebase-admin.ts`, `firebase.json` |
| V-102 | Modelar `products`, `orders`, `downloads`, `profiles` + regras Firestore | 🔶 | P0 | 3 | `orders` agora tem writer server-side real (`src/lib/orders.functions.ts`) para carrinhos gratuitos; `downloads` ainda depende de V-203 (storage) |
| V-103 | Migrar catálogo estático para Firestore (frontend consumindo do banco) | ✅ | P0 | 2 | `src/lib/products.ts` + `src/lib/product-catalog.tsx`; todas as rotas e componentes leem do Firestore |
| V-104 | Autenticação e-mail/senha + recuperação de senha | ✅ | P0 | 3 | `entrar.tsx`, `cadastro.tsx`, `recuperar-senha.tsx` |
| V-105 | Google Sign-In | ✅ | P1 | 1 | `signInWithGoogle` em `auth.tsx` |
| V-106 | Custom claim `role` (admin/cliente) + mecanismo para concedê-la | ✅ | P0 | 2 | `scripts/set-admin-role.mjs` (`bun run set-admin <email>`) chama `setCustomUserClaims` |
| V-107 | Proteger `/conta` com gate de rota autenticada | ✅ | P0 | 1 | Redireciona para `/entrar` se deslogado |

## Fase 1B — Criação de Produtos / Conteúdo (P0)

> Sem isso, o checkout da Fase 2 teria pra onde vender, mas nada de real pra entregar: os
> 12 produtos do catálogo (V-103) hoje são só ficha de marketing no Firestore — nenhum tem
> o arquivo de entrega real (.xlsx/.docx/.pptx/.pdf). Backlog de ideação já organizado no
> ClickUp, espaço **Vertice - Ecommerce**, lista **Desenvolvimento De Produtos**.

| # | Issue | Status | Prioridade | Est. | Nota |
|---|---|---|---|---|---|
| PC-01 | Checklist de Abertura de Empresa — conteúdo real do produto gratuito | 🔶 | P0 | 2 | Arquivos criados: `deliverables/checklist-abertura-de-empresa.xlsx` (editável, com painel de progresso) e `.pdf` (interativo, 48 checkboxes reais). Falta revisão por contador/advogado e ligar à entrega (depende de V-403) |
| PC-02 | Criar os arquivos reais dos produtos pagos do catálogo atual (12 itens: planilhas, e-books, kits, templates) | 🔶 | P0 | 13 | 1ª onda entregue: `deliverables/planilha-fluxo-de-caixa-empresarial.xlsx` (5 abas, fórmulas reais) + `.pdf` (manual de implantação, 14 páginas). Faltam 11 produtos |
| PC-03 | Padronizar o pipeline de criação (briefing → conteúdo/fórmulas → design → revisão → upload) | ⬜ | P1 | 2 | Esboçado no ClickUp; falta formalizar os status/checklist por etapa |
| PC-04 | Convenção de nomenclatura e organização dos arquivos-fonte antes do upload em Storage | ⬜ | P1 | 1 | Precisa bater com o path `/deliverables/{slug}/...` usado em `storage.rules` (V-203) |
| PC-05 | Priorizar e desenvolver as próximas ideias do backlog (Estante do CEO/CFO, novos e-books/templates) | ⬜ | P2 | — | Backlog vivo no ClickUp (tarefa "Ideias"), sem prazo fixo |

## Fase 2 — Pagamento e Entrega Digital própria (🔄 substituída pela Kiwify, ver Fase 2B)

| # | Issue | Status | Prioridade | Est. | Nota |
|---|---|---|---|---|---|
| V-201 | Integração de pagamento (checkout, Pix/cartão/boleto) | 🔄 | — | 5 | **Substituído pela Kiwify (2026-09-19)**. Ficou implementado com Asaas (`src/lib/asaas.server.ts` + `createOrder` em `orders.functions.ts`, UI em `carrinho.tsx`), mas nunca chegou a rodar uma cobrança real em produção. Código mantido, desligado da navegação. |
| V-202 | Webhook de confirmação → criar pedido e liberar acesso | 🔄 | — | 3 | **Substituído pela Kiwify (2026-09-19)**. `src/routes/api.webhooks.asaas.ts` existe e o webhook chegou a ser cadastrado na Asaas (id `131fcdd0-495c-49e8-ba48-751350a50a74`), mas não foi testado com evento real nem ligado à liberação de acesso. |
| V-203 | Storage privado dos arquivos + links assinados temporários | 🔄 | — | 3 | **Substituído pela Kiwify (2026-09-19)** — é ela quem hospeda e libera o arquivo comprado agora. |
| V-204 | Limite de downloads por pedido e log de auditoria | 🔄 | — | 2 | Feito pela Kiwify. |
| V-205 | E-mail transacional: confirmação de compra + acesso | 🔄 | — | 2 | Feito pela Kiwify. |
| V-206 | Emissão/registro fiscal e recibo em PDF | 🔄 | — | 3 | Feito pela Kiwify. |
| V-207 | Cupons reais no banco (validade, uso único, % ou fixo) | 🔄 | — | 2 | A Kiwify tem cupom próprio; carrinho/cupom do site ficam desativados junto com o resto do checkout. |

## Fase 2B — Vender via Kiwify (P0, decisão 2026-09-19)

| # | Issue | Status | Prioridade | Est. | Nota |
|---|---|---|---|---|---|
| K-001 | Cadastrar cada produto na Kiwify (nome, preço, descrição, arquivo de entrega) | ⬜ | P0 | — | Bloqueado por `PC-02`: a Kiwify também precisa do arquivo real pra vender, não só o site. Pode ser feito aos poucos, um produto por vez, assim que o arquivo dele ficar pronto. |
| K-002 | Colar o link de checkout de cada produto no campo `Product.kiwifyUrl` (Firestore) | ⬜ | P0 | 1 | Código já pronto (PR #5): sem o link, o botão mostra "Em breve"; com o link, vira "Comprar na Kiwify" sozinho. Atualização manual pelo Firebase Console, produto a produto, conforme forem sendo cadastrados na Kiwify. |
| K-003 | Webhook Kiwify → Firestore, só para registro interno de vendas (opcional) | ⬜ | P3 | 2 | Não bloqueia a venda — a Kiwify já entrega tudo sozinha. Só faria sentido se quiser ver vendas dentro do próprio painel/admin do site no futuro. |

## Fase 3 — Experiência do Cliente (P1)

| # | Issue | Status | Prioridade | Est. | Nota |
|---|---|---|---|---|---|
| V-301 | "Meus produtos" e "Downloads" com dados reais | 🔄 | — | 2 | **Deprioritizado (2026-09-19)** — a área de membros da Kiwify já cobre isso. `conta.tsx` continua com `products.slice(0,3)` mockado; revisitar só se quiser unificar a experiência no site futuramente. |
| V-302 | Histórico de pedidos com status e reenvio de acesso | 🔄 | — | 2 | **Deprioritizado (2026-09-19)** — histórico de compra fica na Kiwify por enquanto. |
| V-303 | Favoritos persistidos por usuário | ⬜ | P2 | 1 | |
| V-304 | Edição de dados, senha e preferências de comunicação | ⬜ | P2 | 2 | |
| V-305 | Central de suporte com ticket por pedido | ⬜ | P2 | 3 | |
| V-306 | Avaliações e depoimentos verificados por compra | ⬜ | P2 | 3 | |
| V-307 | Versionamento de produto e notificação de atualização gratuita | ⬜ | P3 | 3 | |

## Fase 4 — Conteúdo e Aquisição (P1)

| # | Issue | Status | Prioridade | Est. | Nota |
|---|---|---|---|---|---|
| V-401 | Insights com posts reais (Firestore) e página de artigo | ✅ | P1 | 3 | Listagem (`insights.index.tsx`) e home (`index.tsx`) agora buscam de `posts` via Firestore; `insights.$slug.tsx` já lia de lá. `journal` estático removido de `catalog.ts` |
| V-402 | Captura de leads + isca digital | ✅ | P1 | 2 | `LeadCapture.tsx`, `leads.ts`, regra `leads/{leadId}` |
| V-403 | Newsletter e automação de boas-vindas | ⬜ | P2 | 2 | |
| V-404 | Sitemap.xml e robots dinâmicos | ✅ | P1 | 1 | `routes/sitemap[.]xml.ts` |
| V-405 | JSON-LD Article/FAQ nas páginas de conteúdo | ⬜ | P2 | 1 | |
| V-406 | Analytics de eventos (view_item, add_to_cart, purchase) | ⬜ | P1 | 2 | |
| V-407 | Landing pages de campanha por segmento | ⬜ | P3 | 3 | |

## Fase 5 — Admin e Operação (P1)

| # | Issue | Status | Prioridade | Est. |
|---|---|---|---|---|
| V-501 | Painel admin: CRUD de produtos e upload de arquivos | ⬜ | P1 | 5 |
| V-502 | Gestão de pedidos, reembolsos e revogação de acesso — 🔄 deprioritizado (2026-09-19): painel já existe na Kiwify | 🔄 | — | 3 |
| V-503 | Gestão de cupons e campanhas | ⬜ | P2 | 2 |
| V-504 | Dashboard de vendas (receita, ticket médio, top produtos) | ⬜ | P2 | 3 |
| V-505 | Exportação CSV de pedidos e clientes | ⬜ | P3 | 1 |

## Fase 6 — Qualidade, Performance e Conformidade (P1)

| # | Issue | Status | Prioridade | Est. | Nota |
|---|---|---|---|---|---|
| V-601 | Testes E2E do fluxo comprar → pagar → baixar | ⬜ | P1 | 3 | Depende da Fase 2 |
| V-602 | Acessibilidade AA (foco visível, contraste, teclado, ARIA) | ⬜ | P1 | 3 | |
| V-603 | Performance: imagens responsivas, lazy loading, Core Web Vitals | ⬜ | P1 | 2 | |
| V-604 | Estados de erro/vazio/carregamento em todas as rotas | ⬜ | P1 | 2 | |
| V-605 | LGPD: política de privacidade, termos, consentimento de cookies | ✅ | P0 | 2 | `politica-de-privacidade.tsx`, `termos-de-uso.tsx`, `CookieConsent.tsx` |
| V-606 | Scan de segurança e revisão de regras Firestore/Storage | 🔶 | P0 | 2 | `firestore.rules` já modelado com boas práticas (claims, owner-only); falta revisão formal + `storage.rules` de arquivos pagos |
| V-607 | Domínio próprio, publicação e monitoramento | ⬜ | P1 | 1 | |

## Fase 7 — Expansão (P3)

| # | Issue | Status | Prioridade | Est. |
|---|---|---|---|---|
| V-701 | Assinatura Vértice (acesso a toda a biblioteca) | ⬜ | P3 | 8 |
| V-702 | Programa de afiliados | ⬜ | P3 | 5 |
| V-703 | Bundles dinâmicos e precificação por kit | ⬜ | P3 | 3 |
| V-704 | Versão em inglês (i18n) | ⬜ | P3 | 5 |
| V-705 | Área de cursos/vídeo-aulas complementares | ⬜ | P3 | 8 |

---

## Marcos

1. **MVP comercial via Kiwify** — Fase 1B (conteúdo real dos produtos) + Fase 2B (cadastro na Kiwify + `kiwifyUrl`). *Esse é o caminho crítico atual: o site (Fase 0/1) já está pronto como vitrine; o que falta é ter arquivo de entrega real produto a produto e cadastrá-lo na Kiwify — os dois podem andar juntos, produto por produto, sem esperar os 12 ficarem prontos de uma vez.*
2. **Loja completa** — Fases 3, 4 e 5 (o que não foi deprioritizado pela Kiwify).
3. **Escala** — Fases 6 e 7.
4. *(Arquivada por ora)* Checkout e entrega própria (Fase 2 original) — fica no repositório, desativada, caso um dia valha a pena voltar a ter isso no site em vez da Kiwify.

## Sequência recomendada (atualizada — 2026-09-19, pivot para Kiwify)

1. ~~`V-106`, `V-401`, `V-103`, `V-102` (parte 1)~~ ✅ feitos — ver notas nas fases acima.
2. ~~Mockups únicos por produto (12 capas editoriais)~~ ✅ feito (PR #5).
3. ~~Preparar o site para vender via Kiwify (`kiwifyUrl`, botões, carrinho/Asaas desativados do menu)~~ ✅ feito (PR #5) — falta só o dado, não código.
4. **`PC-02` — criar os arquivos reais dos 11 produtos pagos que ainda faltam.** Agora é o item que bloqueia tanto o site quanto a Kiwify diretamente; prioridade máxima do projeto.
5. **`K-001`/`K-002` — cadastrar cada produto na Kiwify assim que o arquivo dele ficar pronto, e colar o link de checkout no Firestore.** Pode ser feito produto a produto, em paralelo com o item 4 (não precisa esperar todos os 11).
6. `PC-01` — fechar a revisão por contador/advogado do Checklist gratuito.
7. `V-606` — revisão de segurança das regras Firestore/Storage (ainda vale, independente da Kiwify).
8. `V-501` — painel admin de produtos (CRUD, upload) — útil mesmo com a Kiwify cuidando do pagamento, pra não depender de editar Firestore na mão.
9. Reavaliar depois do MVP: `V-201`–`V-207` (retomar checkout próprio, se um dia fizer sentido tirar a taxa da Kiwify) e `V-301`/`V-302`/`V-502` (unificar histórico de pedidos no site).
