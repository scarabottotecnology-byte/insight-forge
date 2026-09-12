# Vértice Business Tools — Roadmap & Backlog

Legenda de status: ✅ concluído · 🔶 parcial/infra pronta · ⬜ não iniciado
Legenda de prioridade: **P0** crítico · **P1** alto · **P2** médio · **P3** desejável
Estimativa em pontos (1 = ~meio dia).

> **Nota de arquitetura (2026-08-23):** o backend saiu do plano original (Lovable Cloud /
> Postgres/RLS) e migrou para **Firebase** (Auth, Firestore, Storage). Os itens de Fase 1
> abaixo foram reescritos para refletir isso — regras em `firestore.rules`, tipos em
> `src/lib/firestore-schema.ts`, wiring em `src/lib/firebase.ts` / `firebase-admin.ts`.

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

## Fase 2 — Pagamento e Entrega Digital (P0)

| # | Issue | Status | Prioridade | Est. | Nota |
|---|---|---|---|---|---|
| V-201 | Integração de pagamento (checkout, Pix/cartão/boleto) | ⬜ | P0 | 5 | Gateway decidido: **Asaas** (custo baixo, PIX sem mensalidade). Avaliados também Mercado Pago, Efí e Pagar.me. Implementação ainda não iniciada. |
| V-202 | Webhook de confirmação → criar pedido e liberar acesso | ⬜ | P0 | 3 | |
| V-203 | Storage privado dos arquivos + links assinados temporários | ⬜ | P0 | 3 | |
| V-204 | Limite de downloads por pedido e log de auditoria | ⬜ | P1 | 2 | |
| V-205 | E-mail transacional: confirmação de compra + acesso | ⬜ | P0 | 2 | |
| V-206 | Emissão/registro fiscal e recibo em PDF | ⬜ | P2 | 3 | |
| V-207 | Cupons reais no banco (validade, uso único, % ou fixo) | ⬜ | P1 | 2 | |

## Fase 3 — Experiência do Cliente (P1)

| # | Issue | Status | Prioridade | Est. | Nota |
|---|---|---|---|---|---|
| V-301 | "Meus produtos" e "Downloads" com dados reais | ⬜ | P1 | 2 | `conta.tsx` hoje mostra `products.slice(0,3)` mockado |
| V-302 | Histórico de pedidos com status e reenvio de acesso | ⬜ | P1 | 2 | |
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
| V-502 | Gestão de pedidos, reembolsos e revogação de acesso | ⬜ | P1 | 3 |
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

1. **MVP comercial** — Fases 1, 1B e 2 (venda e entrega ponta a ponta, com produto real por trás). *Fase 1 está com 6 de 7 itens prontos (falta fechar `orders`/`downloads` server-side em V-102); Fase 1B (criação dos produtos) e Fase 2 (pagamento) não iniciadas — são os dois maiores blocos de trabalho restantes, e podem correr em paralelo (conteúdo não depende de checkout, e vice-versa).*
2. **Loja completa** — Fases 3, 4 e 5.
3. **Escala** — Fases 6 e 7.

## Sequência recomendada (atualizada — 2026-09-12)

1. ~~`V-106` — script/função admin para conceder `role: admin` via custom claim.~~ ✅ feito (`scripts/set-admin-role.mjs`).
2. ~~`V-401` — trocar leitura de `journal` estático por Firestore.~~ ✅ feito (home e `/insights` agora buscam de `posts`).
3. ~~`V-103` — migrar o catálogo de produtos (`catalog.ts`) para Firestore.~~ ✅ feito — `src/lib/products.ts` (fetch + cache) e `src/lib/product-catalog.tsx` (contexto de catálogo, populado pelo loader do `__root.tsx`) substituem o array estático em `cart.tsx`, `conta.tsx`, `carrinho.tsx`, `produtos.*`, `insights.*`, `LeadCapture`, `Footer` e `sitemap.xml`. Catálogo semeado via `bun run seed:catalog`; fluxo carrinho/bundle/cupom testado ponta a ponta.
4. ~~`V-102` (parte 1) — writer server-side real para `orders`.~~ ✅ feito — `src/lib/orders.functions.ts` (server function autenticada, revalida preço no Firestore, nunca confia no cliente). Carrinho 100% gratuito finaliza de verdade e grava pedido; carrinho com item pago é bloqueado com aviso claro, já que não existe gateway de pagamento ainda. `downloads` fica para quando V-203 (storage) existir — apontar para um arquivo que não existe seria só encenação.
5. `PC-01` — conteúdo real do Checklist de Abertura de Empresa (o produto gratuito). Prioridade máxima em conteúdo: é a isca que já está ativa no site sem nada pra entregar.
6. `V-201 → V-202 → V-203 → V-205` — checkout, webhook, storage privado com link assinado, e-mail de confirmação. Bloco crítico do MVP comercial em engenharia, ainda não iniciado. Pode correr em paralelo com `PC-02`.
7. `PC-02` — criar os arquivos reais dos 12 produtos pagos do catálogo, em ondas por categoria. Sem isso, `V-203` não tem nada de real para servir.
8. `V-207` — cupons reais (hoje o carrinho já suporta cupom, mas não valida contra o banco).
9. `V-606` — revisão de segurança antes de abrir pagamentos de verdade.
10. `V-301` — "Meus produtos"/"Downloads" com dados reais assim que houver pedidos de verdade.
11. `V-501` — painel admin (CRUD de produtos, gestão de pedidos) — agora desbloqueado por V-106.
