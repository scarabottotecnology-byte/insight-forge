import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, FileText, Heart, LifeBuoy, Receipt, User } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { brl } from "@/lib/catalog";
import { useProductCatalog } from "@/lib/product-catalog";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Vértice" },
      {
        name: "description",
        content: "Área do cliente: produtos adquiridos, downloads seguros, pedidos e dados de acesso.",
      },
      { property: "og:title", content: "Minha conta — Vértice" },
      { property: "og:description", content: "Downloads e pedidos da sua conta Vértice." },
      { property: "og:url", content: "/conta" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/conta" }],
  }),
  component: Account,
});

const sections = [
  { value: "produtos", label: "Meus produtos", icon: FileText },
  { value: "downloads", label: "Downloads", icon: Download },
  { value: "pedidos", label: "Pedidos", icon: Receipt },
  { value: "favoritos", label: "Favoritos", icon: Heart },
  { value: "dados", label: "Dados", icon: User },
  { value: "suporte", label: "Suporte", icon: LifeBuoy },
];

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { products } = useProductCatalog();
  const owned = products.slice(0, 3);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/entrar" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <section className="band-dark min-h-screen">
        <div className="container-editorial flex min-h-screen items-center justify-center py-40">
          <p className="label-micro text-muted-foreground">Carregando…</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="band-dark border-b border-border">
        <div className="container-editorial pt-40 pb-14 lg:pt-48 lg:pb-20">
          <p className="label-micro text-primary">Área do cliente</p>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <h1 className="display-hero">Minha conta</h1>
            <Button variant="hairline" className="text-paper-warm" onClick={() => signOut()}>
              Sair
            </Button>
          </div>
          <p className="mt-8 max-w-md text-sm text-muted-foreground">
            Bem-vindo(a), {user.displayName || user.email}. Produtos, pedidos e downloads reais
            aparecem aqui conforme as próximas etapas do backend forem ligadas.
          </p>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial py-16 lg:py-24">
          <Tabs defaultValue="produtos">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              {sections.map((s) => (
                <TabsTrigger
                  key={s.value}
                  value={s.value}
                  className="label-micro rounded-none border border-border px-5 py-3 data-[state=active]:border-accent-foreground data-[state=active]:bg-transparent"
                >
                  <s.icon className="mr-2 h-3.5 w-3.5" />
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="produtos" className="mt-12">
              <ul className="divide-y divide-border border-y border-border">
                {owned.map((p) => (
                  <li key={p.slug} className="flex flex-wrap items-center justify-between gap-6 py-6">
                    <div>
                      <p className="label-micro text-accent-foreground">{p.type}</p>
                      <Link
                        to="/produtos/$slug"
                        params={{ slug: p.slug }}
                        className="link-underline mt-2 inline-block text-lg"
                      >
                        {p.name}
                      </Link>
                    </div>
                    <Button variant="hairline">Baixar arquivos</Button>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="downloads" className="mt-12">
              <p className="text-sm text-muted-foreground">
                Cada download é liberado por link temporário, com limite de acessos e registro de
                auditoria.
              </p>
            </TabsContent>

            <TabsContent value="pedidos" className="mt-12">
              <ul className="divide-y divide-border border-y border-border text-sm">
                {owned.map((p, i) => (
                  <li key={p.slug} className="flex items-center justify-between gap-6 py-5">
                    <span className="label-micro text-muted-foreground">
                      Pedido #{1000 + i}
                    </span>
                    <span>{p.name}</span>
                    <span className="font-display text-lg">{brl(p.price)}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="favoritos" className="mt-12">
              <p className="text-sm text-muted-foreground">Nenhum favorito salvo ainda.</p>
            </TabsContent>

            <TabsContent value="dados" className="mt-12">
              <dl className="max-w-sm space-y-4 border-y border-border py-6 text-sm">
                <div className="flex justify-between gap-6">
                  <dt className="text-muted-foreground">Nome</dt>
                  <dd>{user.displayName || "—"}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="text-muted-foreground">E-mail</dt>
                  <dd>{user.email}</dd>
                </div>
              </dl>
            </TabsContent>

            <TabsContent value="suporte" className="mt-12">
              <p className="text-sm text-muted-foreground">
                Atendimento por e-mail em até um dia útil, com histórico por pedido.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
}
