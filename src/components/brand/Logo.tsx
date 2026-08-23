import { cn } from "@/lib/utils";

/**
 * VÉRTICE — brand mark.
 * Symbol: a champagne hairline vertex (two converging lines) inside a thin frame.
 * Variants: horizontal (default), vertical, symbol only.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="Vértice"
      className={cn("h-8 w-8", className)}
      fill="none"
    >
      <rect x="0.5" y="0.5" width="31" height="31" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M8 9 L16 23 L24 9" stroke="currentColor" strokeWidth="1.25" />
      <path d="M11.5 9 H20.5" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.55" />
    </svg>
  );
}

export function Logo({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical" | "symbol";
  className?: string;
}) {
  if (orientation === "symbol") return <LogoMark className={className} />;

  return (
    <span
      className={cn(
        "flex items-center text-current",
        orientation === "vertical" ? "flex-col gap-3" : "gap-3",
        className,
      )}
    >
      <LogoMark className="h-7 w-7 text-primary" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35rem] font-normal tracking-[0.3em] uppercase">
          Vértice
        </span>
        <span className="label-micro mt-1 text-[0.5rem] tracking-[0.34em] text-muted-foreground">
          Business Tools
        </span>
      </span>
    </span>
  );
}
