import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-editorial.jpg";
import { Marquee } from "@/components/site/Marquee";
import { Parallax } from "@/components/site/Parallax";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { Button } from "@/components/ui/button";
import { brl, categories, journal, products } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vértice — Ferramentas de negócios, finanças e gestão" },
      {
        name: "description",
        content:
          "Planilhas, dashboards, modelos e e-books profissionais para transformar conhecimento em execução. Download imediato e atualizações vitalícias.",
      },
      { property: "og:title", content: "Vértice — Ferramentas de negócios, finanças e gestão" },
      {
        property: "og:description",
        content: "Uma boutique digital de conhecimento e ferramentas profissionais.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const trust = [
  { label: "Ferramentas aplicáveis", note: "Estruturas prontas para uso real" },
  { label: "Download imediato", note: "Acesso liberado após a compra" },
  { label: "Compra segura", note: "Pagamento e entrega protegidos" },
  { label: "Atualizações vitalícias", note: "Novas versões sem custo" },
];

function Home() {
  const bestSellers = products.filter((p) => p.bestSeller || p.tier === "core").slice(0, 3);
  const featured = products.find((p) => p.slug === "dashboard-financeiro-gerencial")!;
  const kits = products.filter((p) => p.type === "Kit");
  const free = products.filter((p) => p.price === 0);

  return (
    <>
      {/* HERO */}
      <section className="band-dark relative overflow-hidden">
        <div className="container-editorial grid min-h-[86svh] items-center gap-16 pt-36 pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:pt-40">
          <div>
            <Reveal>
              <p className="label-micro text-primary">Boutique digital de ferramentas profissionais</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display-hero mt-10">
                Conhecimento
                <br />
                construído
                <br />
                <em className="text-primary not-italic">para execução.</em>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-10 max-w-md text-base leading-relaxed text-muted-foreground">
                Ferramentas, conhecimento e recursos prontos para transformar ideias em execução —
                em finanças, gestão, estratégia e produtividade.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-12 flex flex-wrap items-center gap-4">
                <Button asChild variant="champagne" size="editorial">
                  <Link to="/produtos">Explorar produtos</Link>
                </Button>
                <Button asChild variant="hairline" size="editorial">
                  <Link to="/produtos" search={{ destaque: "vendidos" } as never}>
                    Ver mais vendidos
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative">
            <div className="absolute -top-6 -left-6 hidden h-24 w-24 border-t border-l border-primary/40 lg:block" />
            <Parallax strength={34}>
              <img
                src={heroImage}
                alt="Composição editorial com documentos e livro de negócios"
                width={1408}
                height={1760}
                className="aspect-[4/5] w-full object-cover shadow-editorial"
              />
            </Parallax>
            <div className="absolute -right-6 -bottom-6 hidden h-24 w-24 border-r border-b border-primary/40 lg:block" />
          </Reveal>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="band-light border-y border-border">
        <div className="container-editorial grid divide-border sm:grid-cols-2 lg:grid-cols-4 lg:divide-x">
          {trust.map((t) => (
            <div key={t.label} className="border-b border-border py-8 lg:border-b-0 lg:px-8 lg:first:pl-0">
              <p className="label-micro">{t.label}</p>
              <p className="mt-3 text-xs text-muted-foreground">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAIXA EM MOVIMENTO */}
      <section className="band-dark border-b border-border">
        <Marquee
          className="text-primary/80"
          items={[
            "Planilhas",
            "Dashboards",
            "E-books",
            "Kits estratégicos",
            "Modelos financeiros",
            "Gestão",
            "Produtividade",
          ]}
        />
      </section>



      {/* CATEGORIAS */}
      <section className="band-light">
        <div className="container-editorial py-24 lg:py-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-micro text-accent-foreground">01 — Catálogo</p>
              <h2 className="display-section mt-6 max-w-xl">Escolha pela decisão que precisa tomar</h2>
            </div>
            <Link to="/produtos" className="label-micro link-underline">
              Ver catálogo completo
            </Link>
          </Reveal>

          <div className="mt-16 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={i * 60}>
                <Link
                  to="/produtos"
                  search={{ categoria: c.name } as never}
                  className="group flex h-full flex-col justify-between bg-card p-8 transition-colors duration-500 hover:bg-secondary lg:p-10"
                >
                  <span className="font-display text-4xl text-accent-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-16">
                    <h3 className="text-2xl">{c.name}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{c.note}</p>
                    <ArrowRight className="mt-6 h-4 w-4 text-accent-foreground transition-transform duration-500 group-hover:translate-x-2" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="band-dark">
        <div className="container-editorial py-24 lg:py-32">
          <Reveal>
            <p className="label-micro text-primary">02 — Mais vendidos</p>
            <h2 className="display-section mt-6 max-w-2xl">
              As ferramentas que entram primeiro na rotina
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <ProductCard product={p} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL FEATURE */}
      <section className="band-light border-y border-border">
        <div className="container-editorial grid items-center gap-16 py-24 lg:grid-cols-2 lg:py-32">
          <Reveal>
            <img
              src={featured.image}
              alt={`Mockup do ${featured.name}`}
              loading="lazy"
              width={1200}
              height={912}
              className="aspect-[5/4] w-full object-cover shadow-lift"
            />
          </Reveal>
          <Reveal delay={100}>
            <p className="label-micro text-accent-foreground">03 — Destaque editorial</p>
            <h2 className="display-section mt-6">{featured.name}</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              {featured.solution}
            </p>
            <ul className="mt-10 space-y-4">
              {featured.benefits.map((b) => (
                <li key={b} className="flex gap-4 border-b border-border pb-4 text-sm">
                  <span className="text-accent-foreground">—</span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex items-center gap-8">
              <span className="font-display text-3xl">{brl(featured.price)}</span>
              <Button asChild variant="ink" size="editorial">
                <Link to="/produtos/$slug" params={{ slug: featured.slug }}>
                  Ver o produto
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* KITS */}
      <section className="band-dark">
        <div className="container-editorial py-24 lg:py-32">
          <Reveal>
            <p className="label-micro text-primary">04 — Soluções</p>
            <h2 className="display-section mt-6 max-w-2xl">
              Kits para resolver um problema inteiro, não um pedaço
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            {kits.map((p, i) => (
              <Reveal key={p.slug} delay={i * 100}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section className="band-light">
        <div className="container-editorial py-24 lg:py-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-micro text-accent-foreground">05 — Insights</p>
              <h2 className="display-section mt-6 max-w-xl">Conteúdo que antecede a ferramenta</h2>
            </div>
            <Link to="/insights" className="label-micro link-underline">
              Ler todos
            </Link>
          </Reveal>
          <div className="mt-16 grid gap-px border border-border bg-border lg:grid-cols-3">
            {journal.map((a, i) => (
              <Reveal key={a.slug} delay={i * 70}>
                <article className="flex h-full flex-col bg-card p-8 lg:p-10">
                  <p className="label-micro text-accent-foreground">{a.kicker}</p>
                  <h3 className="mt-6 text-2xl leading-tight">{a.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {a.excerpt}
                  </p>
                  <Link
                    to="/produtos/$slug"
                    params={{ slug: a.related }}
                    className="label-micro link-underline mt-8 self-start"
                  >
                    Ferramenta relacionada
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FREE + NEWSLETTER */}
      <section className="band-dark border-t border-border">
        <div className="container-editorial grid gap-16 py-24 lg:grid-cols-2 lg:py-32">
          <Reveal>
            <p className="label-micro text-primary">06 — Recursos gratuitos</p>
            <h2 className="display-section mt-6">Comece sem custo</h2>
            <div className="mt-10 space-y-px">
              {free.map((p) => (
                <Link
                  key={p.slug}
                  to="/produtos/$slug"
                  params={{ slug: p.slug }}
                  className="group flex items-center justify-between border-y border-border py-6"
                >
                  <span>
                    <span className="label-micro text-primary">{p.type}</span>
                    <span className="mt-3 block text-xl">{p.name}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary transition-transform duration-500 group-hover:translate-x-2" />
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100} className="border border-border p-10 lg:p-14">
            <p className="label-micro text-primary">Newsletter</p>
            <h3 className="mt-6 text-3xl leading-tight">
              Uma análise por semana, sem ruído
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Frameworks, leituras financeiras e novos lançamentos do catálogo.
            </p>
            <form
              className="mt-10 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Seu e-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="seu@email.com"
                className="h-13 flex-1 border border-input bg-transparent px-5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <Button type="submit" variant="champagne" size="editorial">
                Assinar
              </Button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="band-light border-t border-border">
        <div className="container-editorial py-28 text-center lg:py-36">
          <Reveal>
            <p className="label-micro text-accent-foreground">Vértice</p>
            <h2 className="display-hero mx-auto mt-8 max-w-3xl">
              Conhecimento, ferramenta, execução, resultado.
            </h2>
            <div className="mt-12 flex justify-center">
              <Button asChild variant="ink" size="editorial">
                <Link to="/produtos">Explorar o catálogo</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
