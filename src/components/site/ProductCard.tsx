import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { brl, type Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type Variant = "standard" | "featured";

export function ProductCard({
  product,
  variant = "standard",
  index,
}: {
  product: Product;
  variant?: Variant;
  index?: number;
}) {
  return (
    <Link
      to="/produtos/$slug"
      params={{ slug: product.slug }}
      className={cn(
        "group relative flex flex-col border border-border bg-card transition-all duration-500 hover:border-primary/45",
        variant === "featured" && "lg:col-span-2",
      )}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={`Mockup do produto ${product.name}`}
          loading="lazy"
          width={1200}
          height={912}
          className={cn(
            "w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]",
            variant === "featured" ? "aspect-[16/10]" : "aspect-[4/3]",
          )}
        />
        {product.badge && (
          <span className="label-micro absolute top-4 left-4 border border-primary/60 bg-background/80 px-3 py-1.5 text-primary backdrop-blur-sm">
            {product.badge}
          </span>
        )}
        {typeof index === "number" && (
          <span className="font-display absolute right-4 bottom-3 text-3xl leading-none text-primary/50">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 lg:p-7">
        <div className="label-micro flex items-center gap-3 text-muted-foreground">
          <span className="text-primary">{product.category}</span>
          <span className="h-px w-6 bg-border" />
          <span>{product.type}</span>
        </div>

        <h3
          className={cn(
            "mt-5 leading-tight",
            variant === "featured" ? "text-3xl lg:text-4xl" : "text-2xl",
          )}
        >
          {product.name}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.tagline}
        </p>

        <div className="mt-8 flex items-end justify-between border-t border-border pt-5">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl text-foreground">{brl(product.price)}</span>
            {product.compareAt && (
              <span className="text-xs text-muted-foreground line-through">
                {brl(product.compareAt)}
              </span>
            )}
          </div>
          <span className="label-micro flex items-center gap-2 text-primary">
            Ver
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
