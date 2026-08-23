# Vértice Business Tools — Roadmap & Backlog

Legenda de prioridade: **P0** crítico · **P1** alto · **P2** médio · **P3** desejável
Estimativa em pontos (1 = ~meio dia).

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

| # | Issue | Prioridade | Est. |
|---|---|---|---|
| V-101 | Ativar Lovable Cloud (banco, storage, auth) | P0 | 1 |
| V-102 | Modelagem: `products`, `orders`, `order_items`, `downloads`, `profiles` + RLS e grants | P0 | 3 |
| V-103 | Migrar catálogo estático para o banco (seed via migração) | P0 | 2 |
| V-104 | Autenticação e-mail/senha + recuperação de senha | P0 | 3 |
| V-105 | Google Sign-In | P1 | 1 |
| V-106 | Tabela `user_roles` + função `has_role` (admin/cliente) | P0 | 2 |
| V-107 | Proteger `/conta` com gate de rota autenticada | P0 | 1 |

## Fase 2 — Pagamento e Entrega Digital (P0)

| # | Issue | Prioridade | Est. |
|---|---|---|---|
| V-201 | Integração de pagamento (checkout, Pix/cartão/boleto) | P0 | 5 |
| V-202 | Webhook de confirmação → criar pedido e liberar acesso | P0 | 3 |
| V-203 | Storage privado dos arquivos + links assinados temporários | P0 | 3 |
| V-204 | Limite de downloads por pedido e log de auditoria | P1 | 2 |
| V-205 | E-mail transacional: confirmação de compra + acesso | P0 | 2 |
| V-206 | Emissão/registro fiscal e recibo em PDF | P2 | 3 |
| V-207 | Cupons reais no banco (validade, uso único, % ou fixo) | P1 | 2 |

## Fase 3 — Experiência do Cliente (P1)

| # | Issue | Prioridade | Est. |
|---|---|---|---|
| V-301 | "Meus produtos" e "Downloads" com dados reais | P1 | 2 |
| V-302 | Histórico de pedidos com status e reenvio de acesso | P1 | 2 |
| V-303 | Favoritos persistidos por usuário | P2 | 1 |
| V-304 | Edição de dados, senha e preferências de comunicação | P2 | 2 |
| V-305 | Central de suporte com ticket por pedido | P2 | 3 |
| V-306 | Avaliações e depoimentos verificados por compra | P2 | 3 |
| V-307 | Versionamento de produto e notificação de atualização gratuita | P3 | 3 |

## Fase 4 — Conteúdo e Aquisição (P1)

| # | Issue | Prioridade | Est. |
|---|---|---|---|
| V-401 | Insights com posts reais (CMS no banco) e página de artigo | P1 | 3 |
| V-402 | Captura de leads + isca digital (mini planilha gratuita) | P1 | 2 |
| V-403 | Newsletter e automação de boas-vindas | P2 | 2 |
| V-404 | Sitemap.xml e robots dinâmicos | P1 | 1 |
| V-405 | JSON-LD Article/FAQ nas páginas de conteúdo | P2 | 1 |
| V-406 | Analytics de eventos (view_item, add_to_cart, purchase) | P1 | 2 |
| V-407 | Landing pages de campanha por segmento | P3 | 3 |

## Fase 5 — Admin e Operação (P1)

| # | Issue | Prioridade | Est. |
|---|---|---|---|
| V-501 | Painel admin: CRUD de produtos e upload de arquivos | P1 | 5 |
| V-502 | Gestão de pedidos, reembolsos e revogação de acesso | P1 | 3 |
| V-503 | Gestão de cupons e campanhas | P2 | 2 |
| V-504 | Dashboard de vendas (receita, ticket médio, top produtos) | P2 | 3 |
| V-505 | Exportação CSV de pedidos e clientes | P3 | 1 |

## Fase 6 — Qualidade, Performance e Conformidade (P1)

| # | Issue | Prioridade | Est. |
|---|---|---|---|
| V-601 | Testes E2E do fluxo comprar → pagar → baixar | P1 | 3 |
| V-602 | Acessibilidade AA (foco visível, contraste, teclado, ARIA) | P1 | 3 |
| V-603 | Performance: imagens responsivas, lazy loading, Core Web Vitals | P1 | 2 |
| V-604 | Estados de erro/vazio/carregamento em todas as rotas | P1 | 2 |
| V-605 | LGPD: política de privacidade, termos, consentimento de cookies | P0 | 2 |
| V-606 | Scan de segurança e revisão de RLS | P0 | 2 |
| V-607 | Domínio próprio, publicação e monitoramento | P1 | 1 |

## Fase 7 — Expansão (P3)

| # | Issue | Prioridade | Est. |
|---|---|---|---|
| V-701 | Assinatura Vértice (acesso a toda a biblioteca) | P3 | 8 |
| V-702 | Programa de afiliados | P3 | 5 |
| V-703 | Bundles dinâmicos e precificação por kit | P3 | 3 |
| V-704 | Versão em inglês (i18n) | P3 | 5 |
| V-705 | Área de cursos/vídeo-aulas complementares | P3 | 8 |

---

## Marcos

1. **MVP comercial** — Fases 1 e 2 (venda e entrega ponta a ponta).
2. **Loja completa** — Fases 3, 4 e 5.
3. **Escala** — Fases 6 e 7.

## Sequência recomendada

`V-101 → V-102 → V-103 → V-104 → V-107 → V-201 → V-202 → V-203 → V-205 → V-605 → V-606 → V-301 → V-501`
