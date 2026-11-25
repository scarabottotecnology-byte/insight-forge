import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Estante da coleção "Estante do Empresário" — 26 e-books em 7 ondas.
 * Cada lombada é um livro: numeral romano no topo (nº da coleção), título na
 * vertical e o status na base. Os livros sobem da prateleira em sequência quando
 * a estante entra na tela e "saem um dedo" ao passar o mouse.
 * Lançados usam a paleta registrada da própria capa; os demais ficam em tinta.
 */
type Status = "lancamento" | "revisao" | "producao" | "breve";

type Book = {
  n: number;
  title: string;
  /** Título curto para a lombada (o título completo aparece na ficha). */
  spine?: string;
  wave: number;
  status: Status;
  cover?: { bg: [string, string]; accent: string };
};

const WAVES = [
  "Lucro e margem",
  "Entender os números",
  "Caixa",
  "Planejamento e controle",
  "Decisões de investimento",
  "Tributário",
  "C-level",
];

const BOOKS: Book[] = [
  { n: 1, title: "Preço Certo", wave: 1, status: "lancamento", cover: { bg: ["#2A2824", "#1D1C1A"], accent: "#C2A878" } },
  { n: 2, title: "Margem de Contribuição na Prática", spine: "Margem de Contribuição", wave: 1, status: "lancamento", cover: { bg: ["#123536", "#0E2B2C"], accent: "#D9B46A" } },
  { n: 3, title: "Markup, Impostos e Taxas", wave: 1, status: "lancamento", cover: { bg: ["#1A2847", "#14203A"], accent: "#E0A458" } },
  { n: 4, title: "A Hora Certa", wave: 1, status: "lancamento", cover: { bg: ["#323234", "#2A2A2C"], accent: "#D9B46A" } },
  { n: 5, title: "DRE sem Mistério", wave: 2, status: "revisao" },
  { n: 6, title: "Lucro x Caixa", wave: 2, status: "producao" },
  { n: 7, title: "Como Ler o que seu Contador Te Entrega", spine: "Como Ler o seu Contador", wave: 2, status: "producao" },
  { n: 8, title: "Os 12 Indicadores da Segunda-feira", spine: "Os 12 Indicadores", wave: 2, status: "producao" },
  { n: 9, title: "Fluxo de Caixa em 13 Semanas", wave: 3, status: "breve" },
  { n: 10, title: "Capital de Giro sem Banco", wave: 3, status: "breve" },
  { n: 11, title: "Rotina Financeira Semanal", spine: "Rotina Financeira", wave: 3, status: "breve" },
  { n: 12, title: "Custos sem Sangria", wave: 3, status: "breve" },
  { n: 13, title: "Orçamento Empresarial em 7 Passos", spine: "Orçamento em 7 Passos", wave: 4, status: "breve" },
  { n: 14, title: "Orçado x Realizado", wave: 4, status: "breve" },
  { n: 15, title: "Gestão por Indicadores", wave: 4, status: "breve" },
  { n: 16, title: "Checklist do Fechamento Mensal", spine: "Fechamento Mensal", wave: 4, status: "breve" },
  { n: 17, title: "Viabilidade em 1 Planilha", wave: 5, status: "breve" },
  { n: 18, title: "Payback, VPL e TIR", wave: 5, status: "breve" },
  { n: 19, title: "Quanto Vale Minha Empresa?", spine: "Quanto Vale a Empresa?", wave: 5, status: "breve" },
  { n: 20, title: "Pró-labore x Distribuição de Lucros", spine: "Pró-labore x Lucros", wave: 6, status: "breve" },
  { n: 21, title: "Simples, Presumido ou Real?", wave: 6, status: "breve" },
  { n: 22, title: "Reforma Tributária para Empresários", spine: "Reforma Tributária", wave: 6, status: "breve" },
  { n: 23, title: "O Report que o Conselho Quer Ler", spine: "O Report do Conselho", wave: 7, status: "breve" },
  { n: 24, title: "Holding e Multiempresas", spine: "Holding e Multiempresas", wave: 7, status: "breve" },
  { n: 25, title: "Value Creation", wave: 7, status: "breve" },
  { n: 26, title: "De Analista a Controller", wave: 7, status: "breve" },
];

const STATUS_LABEL: Record<Status, string> = {
  lancamento: "Lançamento",
  revisao: "Em revisão",
  producao: "Em produção",
  breve: "Em breve",
};

const HEIGHTS = [262, 286, 250, 298, 272, 256, 290, 248, 280, 266];

function roman(n: number) {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

export function CollectionShelf() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const released = BOOKS.filter((b) => b.status === "lancamento").length;

  return (
    <section className="band-dark border-y border-border" aria-labelledby="colecao-titulo">
      <div className="container-editorial py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            <p className="label-micro text-champagne">Coleção · Controladoria para empresários</p>
            <h2 id="colecao-titulo" className="display-section mt-6">
              Estante do <em className="text-champagne italic">Empresário</em>
            </h2>
            <p className="font-display mt-6 max-w-2xl text-xl leading-snug text-paper-warm/80 italic lg:text-2xl">
              O método de um controller, livro a livro: do preço certo ao report que o conselho quer ler.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 border-champagne/30 lg:grid-cols-1 lg:border-l lg:pl-10">
            <div>
              <dt className="text-xs tracking-wider text-paper-warm/60">Títulos na coleção</dt>
              <dd className="font-display mt-1 text-4xl text-paper-warm">{BOOKS.length}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wider text-paper-warm/60">Ondas temáticas</dt>
              <dd className="font-display mt-1 text-4xl text-paper-warm">{roman(WAVES.length)}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-wider text-paper-warm/60">Já lançados</dt>
              <dd className="font-display mt-1 text-4xl text-champagne">{released}</dd>
            </div>
          </dl>
        </div>

        <div ref={ref} className="relative mt-8">
          <div className="scrollbar-none -mx-6 overflow-x-auto px-6 pt-32 lg:mx-0 lg:px-0">
            <ul className="flex min-w-max items-end gap-[3px]" aria-label="Livros da coleção">
              {BOOKS.map((b, i) => {
                const label = b.spine ?? b.title;
                const h = Math.max(HEIGHTS[i % HEIGHTS.length]!, 112 + label.length * 7.4);
                const align = i < 3 ? "left-0" : i > BOOKS.length - 4 ? "right-0" : "left-1/2 -translate-x-1/2";
                const isActive = active === b.n;
                const live = b.status === "lancamento";
                const newWave = i > 0 && BOOKS[i - 1]!.wave !== b.wave;
                return (
                  <li
                    key={b.n}
                    className={cn("relative", newWave && "ml-3")}
                    onMouseEnter={() => setActive(b.n)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <button
                      type="button"
                      onFocus={() => setActive(b.n)}
                      onBlur={() => setActive(null)}
                      aria-label={`Nº ${b.n} — ${b.title} — ${STATUS_LABEL[b.status]}`}
                      className="group block outline-none"
                      style={{
                        transform: shown ? "translateY(0)" : "translateY(110%)",
                        opacity: shown ? 1 : 0,
                        transition: `transform 900ms cubic-bezier(0.22,1,0.36,1) ${i * 45}ms, opacity 600ms ease ${i * 45}ms`,
                      }}
                    >
                      <span
                        className={cn(
                          "relative flex w-[42px] flex-col items-center border transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          "group-hover:-translate-y-4 group-focus-visible:-translate-y-4",
                          live ? "shadow-editorial" : "border-white/10 bg-ink-soft",
                        )}
                        style={{
                          height: h,
                          ...(live && b.cover
                            ? {
                                background: `linear-gradient(90deg, ${b.cover.bg[1]}, ${b.cover.bg[0]} 45%, ${b.cover.bg[1]})`,
                                borderColor: `${b.cover.accent}55`,
                              }
                            : {}),
                        }}
                      >
                        <span
                          className="font-display mt-4 text-[13px] tracking-[0.12em]"
                          style={{ color: live ? b.cover?.accent : "var(--color-champagne)" }}
                        >
                          {roman(b.n)}
                        </span>
                        <span
                          className="mt-3 h-px w-7"
                          style={{ backgroundColor: live ? `${b.cover?.accent}88` : "color-mix(in oklab, var(--color-champagne) 35%, transparent)" }}
                        />
                        <span
                          className={cn(
                            "font-display mt-4 flex-1 overflow-hidden text-[14px] leading-none whitespace-nowrap [writing-mode:vertical-rl] rotate-180",
                            live ? "text-[#F3EFE6]" : "text-paper-warm/55",
                          )}
                        >
                          {label}
                        </span>
                        <span
                          className="mb-3 mt-3 h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: live
                              ? b.cover?.accent
                              : b.status === "breve"
                                ? "transparent"
                                : "var(--color-champagne)",
                            border: b.status === "breve" ? "1px solid color-mix(in oklab, var(--color-champagne) 45%, transparent)" : undefined,
                            opacity: b.status === "producao" || b.status === "revisao" ? 0.6 : 1,
                          }}
                          aria-hidden
                        />
                      </span>
                    </button>

                    <div
                      className={cn(
                        "pointer-events-none absolute bottom-full z-10 mb-6 w-52 border border-champagne/30 bg-ink-soft p-4 opacity-0 shadow-editorial transition-all duration-300",
                        align,
                        isActive && "opacity-100",
                      )}
                      role="tooltip"
                    >
                      <p className="label-micro text-champagne-soft">
                        Nº {String(b.n).padStart(2, "0")} · Onda {b.wave}
                      </p>
                      <p className="font-display mt-2 text-base leading-tight text-paper-warm">{b.title}</p>
                      <p className="mt-2 text-xs text-paper-warm/60">{WAVES[b.wave - 1]}</p>
                      <p className={cn("mt-3 text-xs", live ? "text-champagne" : "text-paper-warm/70")}>
                        {STATUS_LABEL[b.status]}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div
            className="h-3 w-full"
            style={{
              background: "linear-gradient(180deg, #5A4630 0%, #3B2E20 55%, #241C14 100%)",
              boxShadow: "0 18px 30px -18px rgba(0,0,0,0.9)",
            }}
            aria-hidden
          />
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-paper-warm/60">
            <span>Cada lombada é um livro; o numeral é o número na coleção.</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-champagne" /> Lançado ou em produção
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full border border-champagne/50" /> Em breve
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
