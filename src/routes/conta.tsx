import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, FileText, Heart, LifeBuoy, Receipt, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { brl } from "@/lib/catalog";
import {
  createDownloadLink,
  listMyLibrary,
  type LibraryItem,
  type LibraryOrder,
} from "@/lib/downloads.functions";
import { useProductCatalog } from "@/lib/product-catalog";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Vértice" },
      {
        name: "description",
        content:
          "Área do cliente: produtos adquiridos, downloads seguros, pedidos e dados de acesso.",
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

const ORDER_STATUS_LABEL: Record<LibraryOrder["status"], string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  refunded: "Reembolsado",
  canceled: "Cancelado",
};

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { products } = useProductCatalog();

  const [library, setLibrary] = useState<{ orders: LibraryOrder[]; items: LibraryItem[] } | null>(
    null,
  );
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const productName = useCallback(
    (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug,
    [products],
  );

  const refreshLibrary = useCallback(async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      setLibrary(await listMyLibrary({ data: { idToken } }));
      setLibraryError(null);
    } catch (error) {
      setLibraryError(
        error instanceof Error ? error.message : "Não foi possível carregar seus pedidos.",
      );
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/entrar" });
      return;
    }
    void refreshLibrary();
  }, [loading, user, navigate, refreshLibrary]);

  const baixar = async (item: LibraryItem) => {
    if (!user) return;
    setDownloading(item.grantId);
    try {
      const idToken = await user.getIdToken();
      const { url, remaining } = await createDownloadLink({
        data: { idToken, grantId: item.grantId },
      });
      // The signed URL carries `attachment`, so navigating to it saves the file without
      // leaving the page.
      window.location.assign(url);
      toast.success("Download liberado", {
        description:
          remaining > 0
            ? `Restam ${remaining} downloads deste arquivo.`
            : "Era seu último download.",
      });
      await refreshLibrary();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o link.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading || !user) {
    return (
      <section className="band-dark min-h-screen">
        <div className="container-editorial flex min-h-screen items-center justify-center py-40">
          <p className="label-micro text-muted-foreground">Carregando…</p>
        </div>
      </section>
    );
  }

  const items = library?.items ?? [];
  const orders = library?.orders ?? [];

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
            Bem-vindo(a), {user.displayName || user.email}. Cada arquivo é entregue por link
            temporário, gerado na hora e válido por poucos minutos.
          </p>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial py-16 lg:py-24">
          {libraryError && (
            <p className="mb-10 border border-destructive/40 p-5 text-sm text-destructive">
              {libraryError}
            </p>
          )}

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
              {items.length === 0 ? (
                <EmptyState
                  text={
                    library
                      ? "Você ainda não tem produtos liberados. Assim que um pedido for confirmado, os arquivos aparecem aqui."
                      : "Carregando seus produtos…"
                  }
                />
              ) : (
                <ul className="divide-y divide-border border-y border-border">
                  {items.map((item) => (
                    <li
                      key={item.grantId}
                      className="flex flex-wrap items-center justify-between gap-6 py-6"
                    >
                      <div>
                        <p className="label-micro text-accent-foreground">{item.fileName}</p>
                        <Link
                          to="/produtos/$slug"
                          params={{ slug: item.productSlug }}
                          className="link-underline mt-2 inline-block text-lg"
                        >
                          {productName(item.productSlug)}
                        </Link>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {item.available
                            ? `${item.maxDownloads - item.downloadsUsed} de ${item.maxDownloads} downloads restantes · acesso até ${formatDate(item.expiresAt)}`
                            : item.unavailableReason}
                        </p>
                      </div>
                      <Button
                        variant="hairline"
                        disabled={!item.available || downloading === item.grantId}
                        onClick={() => baixar(item)}
                      >
                        {downloading === item.grantId ? "Gerando link…" : "Baixar arquivo"}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="downloads" className="mt-12">
              <p className="max-w-xl text-sm text-muted-foreground">
                Cada download é liberado por um link assinado que expira em minutos, com limite de
                acessos por pedido e registro de auditoria. O arquivo nunca fica em endereço
                público.
              </p>
              {items.length > 0 && (
                <ul className="mt-8 divide-y divide-border border-y border-border text-sm">
                  {items.map((item) => (
                    <li
                      key={item.grantId}
                      className="flex flex-wrap items-center justify-between gap-4 py-5"
                    >
                      <span>{productName(item.productSlug)}</span>
                      <span className="label-micro text-muted-foreground">
                        {item.downloadsUsed}/{item.maxDownloads} usados
                      </span>
                      <span className="label-micro text-muted-foreground">
                        {item.available ? `até ${formatDate(item.expiresAt)}` : "indisponível"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="pedidos" className="mt-12">
              {orders.length === 0 ? (
                <EmptyState
                  text={library ? "Nenhum pedido por aqui ainda." : "Carregando seus pedidos…"}
                />
              ) : (
                <ul className="divide-y divide-border border-y border-border text-sm">
                  {orders.map((order) => (
                    <li key={order.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-5">
                      <span className="label-micro text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="flex-1">{order.items.map((i) => i.name).join(", ")}</span>
                      <span className="label-micro text-accent-foreground">
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                      <span className="font-display text-lg">{brl(order.total)}</span>
                      {order.status === "pending" && order.invoiceUrl && (
                        <a
                          href={order.invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="link-underline text-xs"
                        >
                          Concluir pagamento
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-border p-10">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Button asChild variant="ink" size="editorial" className="mt-8">
        <Link to="/produtos">Explorar produtos</Link>
      </Button>
    </div>
  );
}
