import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LifeBuoy, Receipt, User } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Vértice" },
      {
        name: "description",
        content: "Área do cliente Vértice: dados de acesso e suporte.",
      },
      { property: "og:title", content: "Minha conta — Vértice" },
      { property: "og:description", content: "Área do cliente Vértice." },
      { property: "og:url", content: "/conta" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/conta" }],
  }),
  component: Account,
});

const sections = [
  { value: "compras", label: "Minhas compras", icon: Receipt },
  { value: "dados", label: "Dados", icon: User },
  { value: "suporte", label: "Suporte", icon: LifeBuoy },
];

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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
            Bem-vindo(a), {user.displayName || user.email}.
          </p>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial py-16 lg:py-24">
          <Tabs defaultValue="compras">
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

            <TabsContent value="compras" className="mt-12 max-w-md">
              <p className="text-sm text-muted-foreground">
                Suas compras são processadas e entregues pela Kiwify. O acesso aos arquivos e a
                nota fiscal chegam por e-mail assim que o pagamento é confirmado, e ficam
                disponíveis também na área de membros da Kiwify.
              </p>
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
