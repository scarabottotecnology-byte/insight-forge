import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Heart, LifeBuoy, Receipt, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brl, products } from "@/lib/catalog";

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

const owned = products.slice(0, 3);

const sections = [
  { value: "produtos", label: "Meus produtos", icon: FileText },
  { value: "downloads", label: "Downloads", icon: Download },
  { value: "pedidos", label: "Pedidos", icon: Receipt },
  { value: "favoritos", label: "Favoritos", icon: Heart },
  { value: "dados", label: "Dados", icon: User },
  { value: "suporte", label: "Suporte", icon: LifeBuoy },
];

function Account() {
  return (
    <>
      <section className="band-dark border-b border-border">
        <div className="container-editorial pt-40 pb-14 lg:pt-48 lg:pb-20">
          <p className="label-micro text-primary">Área do cliente</p>
          <h1 className="display-hero mt-8">Minha conta</h1>
          <p className="mt-8 max-w-md text-sm text-muted-foreground">
            Esta é a estrutura da área do cliente. A autenticação e os downloads assinados são
            ativados quando o backend for conectado.
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
              <p className="text-sm text-muted-foreground">
                Dados pessoais, e-mail de acesso e preferências de comunicação.
              </p>
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
