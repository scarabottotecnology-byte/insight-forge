import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { brl, getProduct, products } from "@/lib/catalog";
import { getRequestOrigin } from "@/lib/origin.functions";

export const Route = createFileRoute("/produtos/$slug")({
  loader: async ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product, origin: await getRequestOrigin() };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Produto indisponível — Vértice" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    const origin = loaderData.origin ?? "";
    const url = `/produtos/${params.slug}`;
    const abs = (path: string) => (origin ? `${origin}${path}` : path);
    const title = `${p.name} — Vértice`;
    const image = origin ? `${origin}${p.image}` : undefined;

    return {
      meta: [
        { title },
        { name: "description", content: p.tagline },
        { property: "og:title", content: title },
        { property: "og:description", content: p.tagline },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.tagline,
            category: p.category,
            image: image ? [image] : undefined,
            brand: { "@type": "Brand", name: "Vértice" },
            offers: {
              "@type": "Offer",
              url: abs(url),
              price: p.price,
              priceCurrency: "BRL",
              availability: "https://schema.org/InStock",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "Catálogo", item: abs("/produtos") },
              { "@type": "ListItem", position: 3, name: p.name, item: abs(url) },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: p.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: ProductPage,
});


function ProductPage() {
  const { product } = Route.useLoaderData();
  const { add, has } = useCart();

  const bundleItems = (product.bundleOf ?? []).map((s) => getProduct(s)).filter(Boolean);
  const individualTotal = bundleItems.reduce((acc, p) => acc + (p?.price ?? 0), 0);
  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 3);
  const upsell = products
    .filter((p) => p.slug !== product.slug && p.type === "Kit")
    .slice(0, 1)[0];

  const addToCart = () => {
    add(product.slug);
    toast.success("Adicionado ao carrinho", { description: product.name });
  };

  return (
    <>
      {/* PRODUCT HERO */}
      <section className="band-dark border-b border-border">
        <div className="container-editorial grid gap-16 pt-36 pb-20 lg:grid-cols-2 lg:pt-44 lg:pb-28">
          <Reveal>
            <img
              src={product.image}
              alt={`Mockup do ${product.name}`}
              width={1200}
              height={912}
              className="aspect-[5/4] w-full object-cover shadow-editorial"
            />
          </Reveal>

          <Reveal delay={80}>
            <nav aria-label="Trilha de navegação" className="label-micro flex gap-3 text-muted-foreground">
              <Link to="/" className="hover:text-primary">
                Início
              </Link>
              <span>/</span>
              <Link to="/produtos" className="hover:text-primary">
                Catálogo
              </Link>
              <span>/</span>
              <span className="text-primary">{product.category}</span>
            </nav>

            <h1 className="mt-8 text-4xl leading-[1.05] lg:text-5xl">{product.name}</h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              {product.tagline}
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-y border-border py-6">
              {[
                ["Tipo", product.type],
                ["Nível", product.level],
                ["Entrega", "Imediata"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="label-micro text-muted-foreground">{k}</dt>
                  <dd className="mt-2 text-sm">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex items-baseline gap-4">
              <span className="font-display text-4xl">{brl(product.price)}</span>
              {product.compareAt && (
                <span className="text-sm text-muted-foreground line-through">
                  {brl(product.compareAt)}
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="champagne" size="editorial" onClick={addToCart}>
                {has(product.slug) ? "No carrinho" : product.price === 0 ? "Obter gratuitamente" : "Adicionar ao carrinho"}
              </Button>
              <Button asChild variant="hairline" size="editorial">
                <Link to="/carrinho">Ir para o checkout</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Acesso imediato após a confirmação · Atualizações vitalícias · Arquivos editáveis
            </p>
          </Reveal>
        </div>
      </section>

      {/* PROBLEMA / SOLUÇÃO */}
      <section className="band-light border-b border-border">
        <div className="container-editorial grid gap-14 py-24 lg:grid-cols-2 lg:py-32">
          <Reveal>
            <p className="label-micro text-accent-foreground">O problema</p>
            <p className="mt-8 font-display text-2xl leading-snug lg:text-3xl">{product.problem}</p>
          </Reveal>
          <Reveal delay={80}>
            <p className="label-micro text-accent-foreground">A solução</p>
            <p className="mt-8 font-display text-2xl leading-snug lg:text-3xl">{product.solution}</p>
          </Reveal>
        </div>
      </section>

      {/* O QUE VOCÊ RECEBE */}
      <section className="band-dark">
        <div className="container-editorial grid gap-16 py-24 lg:grid-cols-[1fr_1fr] lg:py-32">
          <Reveal>
            <p className="label-micro text-primary">O que você recebe</p>
            <ul className="mt-10 space-y-6">
              {product.includes.map((i) => (
                <li key={i} className="flex gap-5 border-b border-border pb-6 text-sm leading-relaxed">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80}>
            <p className="label-micro text-primary">Especificações</p>
            <dl className="mt-10 divide-y divide-border border-y border-border">
              {product.specs.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-6 py-5">
                  <dt className="label-micro text-muted-foreground">{s.label}</dt>
                  <dd className="text-sm">{s.value}</dd>
                </div>
              ))}
            </dl>

            <p className="label-micro mt-14 text-primary">Para quem é</p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {product.audience.map((a) => (
                <li key={a}>— {a}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* BUNDLE VALUE */}
      {bundleItems.length > 0 && (
        <section className="band-light border-y border-border">
          <div className="container-editorial py-24 lg:py-32">
            <Reveal>
              <p className="label-micro text-accent-foreground">Composição do kit</p>
              <h2 className="display-section mt-6 max-w-xl">
                {bundleItems.length} ferramentas com a mesma base de classificação
              </h2>
            </Reveal>
            <div className="mt-14 divide-y divide-border border-y border-border">
              {bundleItems.map((p) => (
                <div key={p!.slug} className="flex items-baseline justify-between gap-6 py-6">
                  <Link to="/produtos/$slug" params={{ slug: p!.slug }} className="link-underline text-lg">
                    {p!.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">{brl(p!.price)}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
              <div>
                <p className="label-micro text-muted-foreground">Valor individual somado</p>
                <p className="mt-3 text-lg line-through">{brl(individualTotal)}</p>
              </div>
              <div>
                <p className="label-micro text-accent-foreground">Valor do kit</p>
                <p className="font-display mt-3 text-4xl">{brl(product.price)}</p>
              </div>
              <div>
                <p className="label-micro text-muted-foreground">Economia</p>
                <p className="mt-3 text-lg">{brl(Math.max(individualTotal - product.price, 0))}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BENEFÍCIOS + FAQ */}
      <section className="band-dark">
        <div className="container-editorial grid gap-16 py-24 lg:grid-cols-2 lg:py-32">
          <Reveal>
            <p className="label-micro text-primary">Benefícios</p>
            <ul className="mt-10 space-y-8">
              {product.benefits.map((b, i) => (
                <li key={b} className="flex gap-6">
                  <span className="font-display text-2xl text-primary/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80}>
            <p className="label-micro text-primary">Perguntas frequentes</p>
            <Accordion type="single" collapsible className="mt-8">
              {product.faq.map((f) => (
                <AccordionItem key={f.q} value={f.q} className="border-border">
                  <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* UPSELL + RELACIONADOS */}
      <section className="band-light border-t border-border">
        <div className="container-editorial py-24 lg:py-32">
          {upsell && (
            <Reveal className="mb-20 flex flex-wrap items-center justify-between gap-8 border border-border p-10 lg:p-14">
              <div className="max-w-lg">
                <p className="label-micro text-accent-foreground">Complete sua solução</p>
                <h2 className="mt-6 text-3xl leading-tight">{upsell.name}</h2>
                <p className="mt-4 text-sm text-muted-foreground">{upsell.tagline}</p>
              </div>
              <Button asChild variant="ink" size="editorial">
                <Link to="/produtos/$slug" params={{ slug: upsell.slug }}>
                  Ver o kit — {brl(upsell.price)}
                </Link>
              </Button>
            </Reveal>
          )}

          <p className="label-micro text-accent-foreground">Produtos relacionados</p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="band-dark border-t border-border">
        <div className="container-editorial py-24 text-center lg:py-32">
          <h2 className="display-section mx-auto max-w-2xl">
            Comece a usar {product.name.toLowerCase()} hoje
          </h2>
          <div className="mt-12 flex justify-center">
            <Button variant="champagne" size="editorial" onClick={addToCart}>
              {has(product.slug) ? "No carrinho" : "Adicionar ao carrinho"} — {brl(product.price)}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
