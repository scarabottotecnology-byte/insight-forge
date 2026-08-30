import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { categories } from "@/lib/catalog";

const columns = [
  {
    title: "Catálogo",
    links: [
      { label: "Todos os produtos", to: "/produtos" },
      { label: "Kits", to: "/produtos" },
      { label: "Recursos gratuitos", to: "/produtos" },
    ],
  },
  {
    title: "Marca",
    links: [
      { label: "Insights", to: "/insights" },
      { label: "Minha conta", to: "/conta" },
      { label: "Carrinho", to: "/carrinho" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de Privacidade", to: "/politica-de-privacidade" },
      { label: "Termos de Uso", to: "/termos-de-uso" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="band-dark border-t border-border">
      <div className="container-editorial py-20 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo orientation="vertical" className="items-start" />
            <p className="mt-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Ferramentas, conhecimento e recursos aplicáveis para profissionais que precisam
              executar com método.
            </p>
          </div>

          <div>
            <p className="label-micro text-primary">Categorias</p>
            <ul className="mt-6 space-y-3">
              {categories.slice(0, 5).map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/produtos"
                    search={{ categoria: c.name } as never}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="label-micro text-primary">{col.title}</p>
              <ul className="mt-6 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rule-gold mt-20 opacity-40" />
        <div className="mt-8 flex flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Vértice Business Tools. Todos os direitos reservados.</p>
          <p className="label-micro">Download imediato · Compra segura · Atualizações vitalícias</p>
        </div>
      </div>
    </footer>
  );
}
