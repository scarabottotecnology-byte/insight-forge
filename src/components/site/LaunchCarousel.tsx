import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { captureLead } from "@/lib/leads";
import { cn } from "@/lib/utils";

/**
 * Lançamentos da Onda 1 da coleção "Estante do Empresário".
 * Cores e motivos de arte seguem o registro de identidade das capas
 * (um fundo escuro e um acento metálico por livro).
 * Enquanto o checkout não estiver ativo, o CTA captura o e-mail para avisar
 * a abertura das vendas (coleção `leads`, source "lancamento-onda-1").
 */
type Launch = {
  slug: string;
  number: string;
  title: string;
  theme: string;
  promise: string;
  story: string;
  bg: [string, string];
  accent: string;
  accent2: string;
  art: "bars" | "cascade" | "rings" | "editorial";
};

const launches: Launch[] = [
  {
    slug: "preco-certo",
    number: "01",
    title: "Preço Certo",
    theme: "Precificação de produtos",
    promise:
      "O método de piso, alvo e teto para formar preço com margem real, sem chute e sem copiar o concorrente.",
    story: "Acompanhe Marta, dona de loja, do prejuízo silencioso à margem que fecha a conta.",
    bg: ["#1D1C1A", "#121110"],
    accent: "#C2A878",
    accent2: "#8F6B3F",
    art: "editorial",
  },
  {
    slug: "margem-de-contribuicao-na-pratica",
    number: "02",
    title: "Margem de Contribuição na Prática",
    theme: "Mix, cortes e decisões",
    promise:
      "Descubra quais produtos, clientes e canais sustentam a empresa e quais a afundam, e decida com base na margem.",
    story: "Rafael tem uma distribuidora em Campinas, 380 itens e um sócio querendo sair.",
    bg: ["#0E2B2C", "#081A1B"],
    accent: "#D9B46A",
    accent2: "#5FA39A",
    art: "bars",
  },
  {
    slug: "markup-impostos-e-taxas",
    number: "03",
    title: "Markup, Impostos e Taxas",
    theme: "Preço por canal de venda",
    promise:
      "Calcule o preço e a margem de cada canal: loja própria, marketplace, WhatsApp, cartão parcelado, frete e anúncios.",
    story: "Uma marca que vende em vários canais descobre onde o lucro some no caminho.",
    bg: ["#14203A", "#0A1222"],
    accent: "#E0A458",
    accent2: "#6C8EBF",
    art: "cascade",
  },
  {
    slug: "a-hora-certa",
    number: "04",
    title: "A Hora Certa",
    theme: "Precificação de serviços",
    promise:
      "Calcule o custo da sua hora, a capacidade real da equipe e o preço de cada projeto, com fator R e Reforma Tributária.",
    story: "Camila e a Agência Trama, em Belo Horizonte, trabalham muito e lucram pouco.",
    bg: ["#2A2A2C", "#161618"],
    accent: "#D9B46A",
    accent2: "#B87333",
    art: "rings",
  },
];

function CoverArt({ launch }: { launch: Launch }) {
  const { accent, accent2, art } = launch;
  if (art === "bars") {
    const h = [92, 74, 58, 44, 33, 25, 18, 13, 9, 6];
    return (
      <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden>
        {h.map((v, i) => (
          <rect key={i} x={8 + i * 19} y={104 - v} width={13} height={v} fill={i < 3 ? accent : accent2} opacity={i < 3 ? 1 : 0.75} />
        ))}
        <line x1="4" y1="104.5" x2="196" y2="104.5" stroke={accent} strokeWidth="0.8" />
      </svg>
    );
  }
  if (art === "cascade") {
    const steps = [
      [8, 10, 96],
      [28, 30, 76],
      [48, 46, 58],
      [68, 60, 42],
    ];
    return (
      <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden>
        {steps.map(([x, y, w], i) => (
          <rect key={i} x={x} y={y} width={w} height={10} fill={accent} opacity={1 - i * 0.15} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={110} y1={65 + i * 3} x2={192} y2={50 + i * 16} stroke={accent2} strokeWidth="1.4" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={192} cy={50 + i * 16} r="2.4" fill={accent2} />
        ))}
      </svg>
    );
  }
  if (art === "rings") {
    return (
      <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden>
        {[44, 34, 24, 14].map((r, i) => (
          <circle key={r} cx="100" cy="56" r={r} fill="none" stroke={i % 2 ? accent2 : accent} strokeWidth="2" />
        ))}
        <line x1="100" y1="56" x2="100" y2="22" stroke={accent} strokeWidth="1.4" />
        <line x1="100" y1="56" x2="124" y2="64" stroke={accent2} strokeWidth="1.4" />
        <circle cx="100" cy="56" r="2.6" fill={accent} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden>
      <line x1="16" y1="88" x2="184" y2="88" stroke={accent} strokeWidth="0.8" />
      {[
        ["Piso", 40, 70],
        ["Alvo", 100, 46],
        ["Teto", 160, 24],
      ].map(([label, x, y]) => (
        <g key={label as string}>
          <line x1={x as number} y1={88} x2={x as number} y2={y as number} stroke={accent} strokeWidth="1.2" />
          <circle cx={x as number} cy={y as number} r="4" fill={accent} />
          <text x={x as number} y={102} textAnchor="middle" fontSize="8" fill={accent} letterSpacing="1.5">
            {(label as string).toUpperCase()}
          </text>
        </g>
      ))}
      <path d="M40 70 L100 46 L160 24" fill="none" stroke={accent2} strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

function Cover({ launch }: { launch: Launch }) {
  return (
    <div
      className="relative mx-auto flex aspect-[3/4] w-full max-w-[300px] flex-col justify-between p-6 shadow-editorial"
      style={{ background: `linear-gradient(160deg, ${launch.bg[0]}, ${launch.bg[1]})`, color: "#F3EFE6" }}
    >
      <div className="flex items-center justify-between text-[9px] font-medium tracking-[0.22em]" style={{ color: launch.accent }}>
        <span>VERTICEBOOKS · ESTANTE DO EMPRESÁRIO</span>
        <span>Nº {launch.number}</span>
      </div>
      <div className="mt-4 h-[34%]">
        <CoverArt launch={launch} />
      </div>
      <div>
        <p className="font-display text-[1.65rem] leading-[1.05]">{launch.title}</p>
        <p className="mt-2 font-display text-sm italic" style={{ color: launch.accent }}>
          {launch.theme}
        </p>
      </div>
      <div className="border-t pt-3 text-[9px] tracking-[0.18em]" style={{ borderColor: `${launch.accent}66` }}>
        JEFFERSON SCARABOTTO
      </div>
    </div>
  );
}

function NotifyForm({ launch }: { launch: Launch }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      await captureLead({ email, source: "lancamento-onda-1", magnetSlug: launch.slug });
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className="mt-10 max-w-md text-sm leading-relaxed" style={{ color: launch.accent }}>
        Pronto. Avisaremos {email} assim que as vendas de {launch.title} abrirem.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 flex max-w-lg flex-col gap-3 sm:flex-row">
      <label htmlFor={`launch-${launch.slug}`} className="sr-only">
        E-mail
      </label>
      <input
        id={`launch-${launch.slug}`}
        type="email"
        required
        placeholder="seu@e-mail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 flex-1 border bg-transparent px-4 text-sm text-[#F3EFE6] placeholder:text-[#F3EFE6]/50 focus:outline-none"
        style={{ borderColor: `${launch.accent}80` }}
      />
      <Button
        type="submit"
        size="editorial"
        disabled={state === "sending"}
        className="label-micro h-12 rounded-none px-8 text-[#121110] hover:opacity-90"
        style={{ backgroundColor: launch.accent }}
      >
        Quero ser avisado
      </Button>
      {state === "error" && (
        <p className="text-xs text-[#F3EFE6]/70 sm:basis-full">Não foi possível registrar agora. Tente de novo.</p>
      )}
    </form>
  );
}

export function LaunchCarousel(): ReactNode {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || paused) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => api.scrollNext(), 7000);
    return () => window.clearInterval(id);
  }, [api, paused]);

  return (
    <section
      aria-label="Lançamentos da coleção Estante do Empresário"
      className="relative pt-20 lg:pt-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="ml-0">
          {launches.map((launch, i) => (
            <CarouselItem key={launch.slug} className="pl-0" aria-roledescription="slide" aria-label={`${i + 1} de ${launches.length}`}>
              <div
                className="w-full"
                style={{ background: `linear-gradient(120deg, ${launch.bg[0]} 0%, ${launch.bg[1]} 100%)`, color: "#F3EFE6" }}
              >
                <div className="container-editorial grid items-center gap-12 py-14 lg:grid-cols-[1.25fr_0.75fr] lg:py-20">
                  <div>
                    <p className="label-micro" style={{ color: launch.accent }}>
                      Lançamento · Nº {launch.number} · Onda 1 — Lucro e margem
                    </p>
                    <h2 className="display-section mt-6">{launch.title}</h2>
                    <p className="mt-3 font-display text-xl italic" style={{ color: launch.accent }}>
                      {launch.theme}
                    </p>
                    <p className="mt-6 max-w-xl text-base leading-relaxed text-[#F3EFE6]/80">{launch.promise}</p>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#F3EFE6]/60">{launch.story}</p>
                    <NotifyForm launch={launch} />
                  </div>
                  <div className="hidden sm:block">
                    <Cover launch={launch} />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="pointer-events-none absolute inset-x-0 bottom-5">
        <div className="container-editorial flex items-center gap-3">
          {launches.map((launch, i) => (
            <button
              key={launch.slug}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Ver ${launch.title}`}
              aria-current={current === i}
              className={cn("pointer-events-auto h-[3px] transition-all", current === i ? "w-10" : "w-5 opacity-40")}
              style={{ backgroundColor: launches[current]?.accent ?? "#C2A878" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
