import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { categories, products } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  categoria: z.string().optional(),
  tipo: z.string().optional(),
  destaque: z.enum(["vendidos", "novidades", "gratuitos"]).optional(),
});

export const Route = createFileRoute("/produtos/")({
  validateSearch: searchSchema,
  loader: async () => ({ origin: await getRequestOrigin() }),
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const title = "Catálogo de planilhas, dashboards e e-books — Vértice";
    const description =
      "Planilhas, dashboards, kits, modelos e e-books de finanças, gestão e estratégia. Filtre por categoria, tipo e nível.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: "Ferramentas profissionais para finanças, gestão e estratégia.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "/produtos" },
      ],
      links: [{ rel: "canonical", href: "/produtos" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Catálogo Vértice",
            numberOfItems: products.length,
            itemListElement: products.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.name,
              url: origin ? `${origin}/produtos/${p.slug}` : `/produtos/${p.slug}`,
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: "/" },
              { "@type": "ListItem", position: 2, name: "Catálogo", item: "/produtos" },
            ],
          }),
        },
      ],
    };
  },
  component: Catalog,
});


const types = ["Planilha", "Dashboard", "E-book", "Template", "Documento", "Checklist", "Kit"];

function Catalog() {
  const { categoria, tipo, destaque } = Route.useSearch();

  const list = useMemo(() => {
    let out = [...products];
    if (categoria) out = out.filter((p) => p.category === categoria);
    if (tipo) out = out.filter((p) => p.type === tipo);
    if (destaque === "vendidos") out = out.filter((p) => p.bestSeller);
    if (destaque === "gratuitos") out = out.filter((p) => p.price === 0);
    return out;
  }, [categoria, tipo, destaque]);

  return (
    <>
      <section className="band-dark border-b border-border">
        <div className="container-editorial pt-40 pb-16 lg:pt-48 lg:pb-24">
          <p className="label-micro text-primary">Catálogo</p>
          <h1 className="display-hero mt-8 max-w-3xl">Ferramentas prontas para aplicar</h1>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-muted-foreground">
            {list.length} {list.length === 1 ? "item disponível" : "itens disponíveis"} em finanças,
            gestão, estratégia e empreendedorismo.
          </p>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial grid gap-14 py-16 lg:grid-cols-[240px_1fr] lg:py-24">
          <aside aria-label="Filtros" className="lg:sticky lg:top-32 lg:self-start">
            <FilterGroup
              title="Categoria"
              options={categories.map((c) => c.name)}
              activeValue={categoria}
              paramKey="categoria"
            />
            <FilterGroup title="Tipo" options={types} activeValue={tipo} paramKey="tipo" />
            <div className="mt-10">
              <p className="label-micro text-accent-foreground">Destaques</p>
              <ul className="mt-5 space-y-3">
                {(
                  [
                    ["vendidos", "Mais vendidos"],
                    ["gratuitos", "Gratuitos"],
                  ] as const
                ).map(([value, label]) => (
                  <li key={value}>
                    <Link
                      to="/produtos"
                      search={(prev) => ({
                        ...prev,
                        destaque: prev.destaque === value ? undefined : value,
                      })}
                      className={cn(
                        "text-sm transition-colors",
                        destaque === value
                          ? "text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/produtos" search={{}} className="label-micro link-underline mt-12 inline-block">
              Limpar filtros
            </Link>
          </aside>

          <div>
            {list.length === 0 ? (
              <p className="border border-border p-10 text-sm text-muted-foreground">
                Nenhum item corresponde a esta combinação de filtros.
              </p>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p, i) => (
                  <Reveal key={p.slug} delay={i * 50}>
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function FilterGroup({
  title,
  options,
  activeValue,
  paramKey,
}: {
  title: string;
  options: string[];
  activeValue: string | undefined;
  paramKey: "categoria" | "tipo";
}) {
  return (
    <div className="mt-10 first:mt-0">
      <p className="label-micro text-accent-foreground">{title}</p>
      <ul className="mt-5 space-y-3">
        {options.map((o) => (
          <li key={o}>
            <Link
              to="/produtos"
              search={(prev) => ({ ...prev, [paramKey]: activeValue === o ? undefined : o })}
              className={cn(
                "text-sm transition-colors",
                activeValue === o
                  ? "text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
