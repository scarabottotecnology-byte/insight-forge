import { createFileRoute, Link } from "@tanstack/react-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { LeadCapture } from "@/components/site/LeadCapture";
import { Reveal } from "@/components/site/Reveal";
import { db } from "@/lib/firebase";
import { useProductCatalog } from "@/lib/product-catalog";
import type { Post } from "@/lib/firestore-schema";

export const Route = createFileRoute("/insights/")({
  loader: async () => {
    const snap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
    const posts = snap.docs.map((d) => d.data() as Post);
    return { posts };
  },
  head: () => ({
    meta: [
      { title: "Insights — análises de gestão e finanças | Vértice" },
      {
        name: "description",
        content:
          "Análises, frameworks e guias práticos de finanças, controladoria e gestão, conectados às ferramentas do catálogo.",
      },
      { property: "og:title", content: "Insights — análises de gestão e finanças" },
      {
        property: "og:description",
        content: "Conteúdo editorial que antecede a ferramenta.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/insights" },
    ],
    links: [{ rel: "canonical", href: "/insights" }],
  }),
  component: Insights,
});

function Insights() {
  const { posts } = Route.useLoaderData();
  const { getProduct } = useProductCatalog();

  return (
    <>
      <section className="band-dark border-b border-border">
        <div className="container-editorial pt-40 pb-16 lg:pt-48 lg:pb-24">
          <p className="label-micro text-primary">Insights</p>
          <h1 className="display-hero mt-8 max-w-3xl">
            Leituras que antecedem
            <br />a ferramenta
          </h1>
        </div>
      </section>

      <section className="band-light border-b border-border">
        <div className="container-editorial py-20 lg:py-24">
          <Reveal>
            <LeadCapture magnetSlug="checklist-abertura-de-empresa" source="insights_page" />
          </Reveal>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial py-20 lg:py-28">
          <div className="divide-y divide-border border-y border-border">
            {posts.map((a, i) => {
              const product = a.related ? getProduct(a.related) : undefined;
              return (
                <Reveal key={a.slug} delay={i * 70}>
                  <article className="grid gap-8 py-12 lg:grid-cols-[160px_1fr_240px] lg:py-16">
                    <div>
                      <p className="label-micro text-accent-foreground">{a.kicker}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{a.readTime} de leitura</p>
                    </div>
                    <div>
                      <Link
                        to="/insights/$slug"
                        params={{ slug: a.slug }}
                        className="link-underline text-3xl leading-tight"
                      >
                        {a.title}
                      </Link>
                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {a.excerpt}
                      </p>
                    </div>
                    {product && (
                      <div className="border-l border-border pl-6 lg:pl-8">
                        <p className="label-micro text-muted-foreground">Ferramenta</p>
                        <Link
                          to="/produtos/$slug"
                          params={{ slug: product.slug }}
                          className="link-underline mt-3 inline-block text-sm"
                        >
                          {product.name}
                        </Link>
                      </div>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
