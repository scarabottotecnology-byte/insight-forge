import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/catalog";
import { useProductCatalog } from "@/lib/product-catalog";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho e checkout — Vértice" },
      {
        name: "description",
        content: "Revise seus itens, aplique cupom e finalize a compra com acesso imediato aos arquivos.",
      },
      { property: "og:title", content: "Carrinho e checkout — Vértice" },
      { property: "og:description", content: "Checkout direto com entrega digital imediata." },
      { property: "og:url", content: "/carrinho" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/carrinho" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, savings, remove, clear, add, has } = useCart();
  const { products } = useProductCatalog();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [done, setDone] = useState(false);

  const upsells = products
    .filter((p) => !has(p.slug) && p.category === detailed[0]?.product.category)
    .slice(0, 3);

  const total = Math.max(subtotal - discount, 0);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "VERTICE10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success("Cupom aplicado", { description: "10% de desconto" });
    } else {
      toast.error("Cupom inválido");
    }
  };

  if (done) {
    return (
      <section className="band-dark">
        <div className="container-editorial flex min-h-screen flex-col items-center justify-center py-40 text-center">
          <p className="label-micro text-primary">Pedido aprovado</p>
          <h1 className="display-section mt-8 max-w-2xl">Acesso liberado</h1>
          <p className="mt-6 max-w-md text-sm text-muted-foreground">
            Os arquivos ficam disponíveis na sua área de downloads com links temporários e seguros.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild variant="champagne" size="editorial">
              <Link to="/conta">Ir para downloads</Link>
            </Button>
            <Button asChild variant="hairline" size="editorial">
              <Link to="/produtos">Continuar no catálogo</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="band-dark border-b border-border">
        <div className="container-editorial pt-40 pb-16 lg:pt-48 lg:pb-20">
          <p className="label-micro text-primary">Checkout</p>
          <h1 className="display-hero mt-8">Seu carrinho</h1>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial grid gap-16 py-20 lg:grid-cols-[1.4fr_1fr] lg:py-28">
          <div>
            {detailed.length === 0 ? (
              <div className="border border-border p-12">
                <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
                <Button asChild variant="ink" size="editorial" className="mt-8">
                  <Link to="/produtos">Explorar produtos</Link>
                </Button>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-border border-y border-border">
                  {detailed.map(({ product }) => (
                    <li key={product.slug} className="flex gap-6 py-8">
                      <img
                        src={product.image}
                        alt={`Mockup do ${product.name}`}
                        loading="lazy"
                        width={1200}
                        height={912}
                        className="h-24 w-32 shrink-0 object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <span className="label-micro text-accent-foreground">{product.type}</span>
                        <Link
                          to="/produtos/$slug"
                          params={{ slug: product.slug }}
                          className="link-underline mt-2 self-start text-lg"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => remove(product.slug)}
                          className="label-micro mt-auto self-start text-muted-foreground hover:text-foreground"
                        >
                          Remover
                        </button>
                      </div>
                      <span className="font-display text-xl">{brl(product.price)}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={clear}
                  className="label-micro mt-6 text-muted-foreground hover:text-foreground"
                >
                  Esvaziar carrinho
                </button>

                {upsells.length > 0 && (
                  <div className="mt-16">
                    <p className="label-micro text-accent-foreground">Complete sua solução</p>
                    <ul className="mt-6 divide-y divide-border border-y border-border">
                      {upsells.map((p) => (
                        <li key={p.slug} className="flex items-center justify-between gap-6 py-5">
                          <span className="text-sm">{p.name}</span>
                          <button
                            onClick={() => {
                              add(p.slug);
                              toast.success("Adicionado ao carrinho", { description: p.name });
                            }}
                            className="label-micro text-accent-foreground hover:text-foreground"
                          >
                            + {brl(p.price)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          <Reveal className="h-fit border border-border p-8 lg:sticky lg:top-32 lg:p-10">
            <p className="label-micro text-accent-foreground">Resumo</p>
            <dl className="mt-8 space-y-4 border-b border-border pb-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{brl(subtotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Economia do catálogo</dt>
                  <dd>−{brl(savings)}</dd>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cupom</dt>
                  <dd>−{brl(discount)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex items-baseline justify-between">
              <span className="label-micro">Total</span>
              <span className="font-display text-3xl">{brl(total)}</span>
            </div>

            <div className="mt-8 flex gap-2">
              <label className="sr-only" htmlFor="cupom">
                Cupom de desconto
              </label>
              <input
                id="cupom"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Cupom"
                className="h-11 flex-1 border border-input bg-transparent px-4 text-sm placeholder:text-muted-foreground focus:border-accent-foreground focus:outline-none"
              />
              <Button variant="hairline" onClick={applyCoupon} className="h-11">
                Aplicar
              </Button>
            </div>

            <Button
              variant="ink"
              size="editorial"
              className="mt-8 w-full"
              disabled={detailed.length === 0}
              onClick={() => {
                clear();
                setDone(true);
              }}
            >
              Finalizar compra
            </Button>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Entrega digital imediata por link seguro e temporário. Ao continuar você concorda com os{" "}
              <Link to="/termos-de-uso" className="link-underline text-foreground">
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link to="/politica-de-privacidade" className="link-underline text-foreground">
                política de privacidade
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
