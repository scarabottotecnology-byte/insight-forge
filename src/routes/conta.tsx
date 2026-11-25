import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { User as FirebaseUser } from "firebase/auth";
import { Download, LifeBuoy, Receipt, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { brl } from "@/lib/catalog";
import {
  downloadDeliverable,
  getMyLibrary,
  type LibraryOrder,
  type LibraryProduct,
} from "@/lib/library.functions";

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

            <TabsContent value="compras" className="mt-12">
              <Purchases user={user} />
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

const STATUS_LABEL: Record<LibraryOrder["status"], string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  refunded: "Reembolsado",
  canceled: "Cancelado",
};

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function saveBase64File(name: string, mimeType: string, base64: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function Purchases({ user }: { user: FirebaseUser }) {
  const [products, setProducts] = useState<LibraryProduct[] | null>(null);
  const [orders, setOrders] = useState<LibraryOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const library = await getMyLibrary({ data: { idToken } });
        if (cancelled) return;
        setProducts(library.products);
        setOrders(library.orders);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Não foi possível carregar suas compras.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const download = async (slug: string, file: string) => {
    setDownloading(`${slug}/${file}`);
    try {
      const idToken = await user.getIdToken();
      const result = await downloadDeliverable({ data: { idToken, slug, file } });
      saveBase64File(result.name, result.mimeType, result.base64);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível baixar o arquivo.");
    } finally {
      setDownloading(null);
    }
  };

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!products)
    return <p className="label-micro text-muted-foreground">Carregando suas compras…</p>;

  const pendingOrders = orders.filter((o) => o.status === "pending");

  return (
    <div className="grid gap-16">
      <div>
        <p className="label-micro text-accent-foreground">Meus produtos</p>
        {products.length === 0 ? (
          <div className="mt-6 max-w-md border border-border p-8">
            <p className="text-sm text-muted-foreground">
              Você ainda não tem compras confirmadas. Assim que um pagamento for aprovado, os
              arquivos aparecem aqui para download.
            </p>
            <Button asChild variant="ink" size="editorial" className="mt-6">
              <Link to="/produtos">Explorar produtos</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {products.map((p) => (
              <li key={p.slug} className="py-8">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <Link
                    to="/produtos/$slug"
                    params={{ slug: p.slug }}
                    className="link-underline font-display text-xl"
                  >
                    {p.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    Comprado em {new Date(p.purchasedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <ul className="mt-5 grid gap-2">
                  {p.files.map((f) => (
                    <li key={f.name}>
                      <button
                        type="button"
                        onClick={() => download(p.slug, f.name)}
                        disabled={downloading !== null}
                        className="flex w-full items-center justify-between gap-4 border border-border px-4 py-3 text-left text-sm transition-colors hover:border-accent-foreground disabled:opacity-60"
                      >
                        <span className="flex items-center gap-3">
                          <Download className="h-4 w-4 shrink-0" />
                          {f.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {downloading === `${p.slug}/${f.name}` ? "Baixando…" : formatSize(f.size)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pendingOrders.length > 0 && (
        <div>
          <p className="label-micro text-accent-foreground">Aguardando pagamento</p>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {pendingOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <span className="text-sm">{o.items.map((i) => i.name).join(", ")}</span>
                <span className="flex items-center gap-6">
                  <span className="text-sm">{brl(o.total)}</span>
                  {o.invoiceUrl && (
                    <a
                      href={o.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="label-micro link-underline text-accent-foreground"
                    >
                      Pagar
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {orders.length > 0 && (
        <div>
          <p className="label-micro text-accent-foreground">Histórico de pedidos</p>
          <ul className="mt-6 divide-y divide-border border-y border-border text-sm">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap justify-between gap-4 py-4">
                <span>
                  {new Date(o.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                  {o.items.map((i) => i.name).join(", ")}
                </span>
                <span className="text-muted-foreground">
                  {STATUS_LABEL[o.status]} · {brl(o.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
