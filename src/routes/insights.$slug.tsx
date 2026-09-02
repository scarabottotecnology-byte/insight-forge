import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";
import { Reveal } from "@/components/site/Reveal";
import { db } from "@/lib/firebase";
import type { Post } from "@/lib/firestore-schema";
import { getProduct } from "@/lib/catalog";
import { getOrigin } from "@/lib/origin.functions";

export const Route = createFileRoute("/insights/$slug")({
  loader: async ({ params }) => {
    const snap = await getDoc(doc(db, "posts", params.slug));
    if (!snap.exists()) throw notFound();
    const post = snap.data() as Post;
    return { post, origin: await getOrigin() };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Artigo indisponível — Vértice" }, { name: "robots", content: "noindex" }] };
    }
    const { post, origin } = loaderData;
    const url = `/insights/${params.slug}`;
    const abs = (path: string) => (origin ? `${origin}${path}` : path);
    const title = `${post.title} — Vértice`;

    return {
      meta: [
        { title },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            articleSection: post.kicker,
            author: { "@type": "Organization", name: "Vértice" },
            publisher: { "@type": "Organization", name: "Vértice" },
            mainEntityOfPage: abs(url),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "Insights", item: abs("/insights") },
              { "@type": "ListItem", position: 3, name: post.title, item: abs(url) },
            ],
          }),
        },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { post } = Route.useLoaderData();
  const related = post.related ? getProduct(post.related) : undefined;

  return (
    <>
      <section className="band-dark border-b border-border">
        <div className="container-editorial max-w-3xl pt-40 pb-16 lg:pt-48 lg:pb-24">
          <nav aria-label="Trilha de navegação" className="label-micro flex gap-3 text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Início
            </Link>
            <span>/</span>
            <Link to="/insights" className="hover:text-primary">
              Insights
            </Link>
          </nav>
          <p className="label-micro mt-8 text-primary">{post.kicker}</p>
          <h1 className="display-hero mt-6">{post.title}</h1>
          <p className="mt-6 text-sm text-muted-foreground">{post.readTime} de leitura</p>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial max-w-3xl space-y-14 py-20 lg:py-28">
          {post.sections.map((section, i) => (
            <Reveal key={section.heading} delay={i * 60}>
              <h2 className="display-section text-2xl">{section.heading}</h2>
              <div className="mt-5 space-y-4">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-base leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>
          ))}

          {related && (
            <Reveal className="flex flex-wrap items-center justify-between gap-8 border border-border p-10">
              <div className="max-w-md">
                <p className="label-micro text-accent-foreground">Ferramenta relacionada</p>
                <h2 className="mt-4 text-2xl leading-tight">{related.name}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{related.tagline}</p>
              </div>
              <Link
                to="/produtos/$slug"
                params={{ slug: related.slug }}
                className="label-micro border border-primary/50 px-8 py-4 text-primary hover:bg-primary/5"
              >
                Ver ferramenta
              </Link>
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
