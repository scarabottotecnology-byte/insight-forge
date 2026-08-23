import { cn } from "@/lib/utils";

/** Faixa editorial em movimento contínuo. */
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const track = [...items, ...items];
  return (
    <div className={cn("marquee group overflow-hidden", className)} aria-hidden>
      <div className="marquee-track flex w-max items-center gap-12 py-5">
        {track.map((item, i) => (
          <span key={`${item}-${i}`} className="label-micro flex items-center gap-12 whitespace-nowrap">
            {item}
            <span className="inline-block h-1 w-1 rotate-45 bg-champagne" />
          </span>
        ))}
      </div>
    </div>
  );
}
