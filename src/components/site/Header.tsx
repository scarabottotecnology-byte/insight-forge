import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/produtos", label: "Produtos" },
  { to: "/produtos", label: "Mais vendidos", search: { destaque: "vendidos" as const } },
  { to: "/produtos", label: "Kits", search: { tipo: "Kit" } },
  { to: "/insights", label: "Insights" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-500",
        scrolled
          ? "border-border bg-ink/95 py-3 backdrop-blur-md"
          : "border-transparent bg-transparent py-6",
      )}
    >
      <div className="container-editorial flex items-center justify-between gap-8 text-paper-warm">
        <Link to="/" aria-label="Vértice — página inicial">
          <Logo />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-10 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search as never}
              className="label-micro link-underline text-paper-warm/80 transition-colors hover:text-paper-warm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            to="/produtos"
            aria-label="Buscar produtos"
            className="text-paper-warm/70 transition-colors hover:text-primary"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            to="/conta"
            aria-label="Minha conta"
            className="hidden text-paper-warm/70 transition-colors hover:text-primary sm:block"
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            to="/carrinho"
            aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
            className="relative text-paper-warm/70 transition-colors hover:text-primary"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="label-micro absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center bg-champagne px-1 text-[0.5rem] text-ink">
                {count}
              </span>
            )}
          </Link>

          <Sheet>
            <SheetTrigger
              aria-label="Abrir menu"
              className="text-paper-warm/70 transition-colors hover:text-primary lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="border-border bg-ink text-paper-warm">
              <nav aria-label="Navegação móvel" className="mt-14 flex flex-col gap-7">
                {nav.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    search={item.search as never}
                    className="label-micro text-paper-warm/85"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link to="/conta" className="label-micro text-paper-warm/85">
                  Minha conta
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
