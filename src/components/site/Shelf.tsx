import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { brl, type Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * Lombadas de livro numa estante — cada item sobe e inclina como se fosse puxado
 * um dedo para fora, revelando nome e preço. A ordem é a ordem recomendada de uso
 * (diagnóstico → execução → resultado), não decorativa.
 */
const SPINE_HEIGHTS = [248, 272, 230, 288, 254, 266];
const SPINE_TONES = ["ink", "gold", "ink", "ink", "gold", "ink"] as const;

export function Shelf({ products }: { products: Product[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="relative">
      <div className="scrollbar-none -mx-6 flex gap-3 overflow-x-auto px-6 pb-2 sm:gap-4 lg:mx-0 lg:gap-5 lg:px-0">
        {products.map((p, i) => {
          const isActive = active === p.slug;
          const tone = SPINE_TONES[i % SPINE_TONES.length];
          const height = SPINE_HEIGHTS[i % SPINE_HEIGHTS.length];
          return (
            <Link
              key={p.slug}
              to="/produtos/$slug"
              params={{ slug: p.slug }}
              onMouseEnter={() => setActive(p.slug)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(p.slug)}
              onBlur={() => setActive(null)}
              className="group relative shrink-0 outline-none"
              style={{ width: "clamp(52px, 7vw, 68px)" }}
              aria-label={`${p.name} — ${brl(p.price)}`}
            >
              <div
                className={cn(
                  "relative flex items-end justify-center overflow-hidden border-t border-r border-l transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  tone === "gold"
                    ? "border-champagne/50 bg-champagne text-ink"
                    : "border-white/10 bg-ink-soft text-paper-warm",
                  "group-hover:-translate-y-3 group-focus-visible:-translate-y-3",
                  "group-hover:-rotate-2 group-focus-visible:-rotate-2",
                  "group-hover:shadow-lift group-focus-visible:shadow-lift",
                )}
                style={{ height }}
              >
                <span
                  className="font-display mb-5 origin-center text-[13px] leading-none font-medium tracking-wide whitespace-nowrap [writing-mode:vertical-rl]"
                  aria-hidden
                >
                  {p.name}
                </span>
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-1",
                    tone === "gold" ? "bg-ink/20" : "bg-champagne/70",
                  )}
                  aria-hidden
                />
              </div>

              {/* Ficha que aparece ao puxar o livro */}
              <div
                className={cn(
                  "pointer-events-none absolute top-0 left-1/2 w-44 -translate-x-1/2 -translate-y-[calc(100%+14px)] border border-champagne/30 bg-ink-soft p-4 opacity-0 shadow-editorial transition-all duration-300",
                  isActive && "opacity-100",
                )}
              >
                <p className="label-micro text-champagne-soft">{p.type}</p>
                <p className="font-display mt-2 text-sm leading-tight text-paper-warm">{p.name}</p>
                <p className="mt-3 text-xs text-champagne-soft">{brl(p.price)}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rule-gold mt-0" />
      <div
        className="h-3 bg-gradient-to-b from-champagne/25 to-transparent"
        aria-hidden
      />
    </div>
  );
}
