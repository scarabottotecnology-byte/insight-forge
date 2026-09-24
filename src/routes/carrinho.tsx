import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/catalog";
import { createOrder, getOrderStatus } from "@/lib/orders.functions";
import { useProductCatalog } from "@/lib/product-catalog";

// Checkout próprio (Asaas) foi desativado quando as vendas passaram para a Kiwify —
// esta rota não tem mais nenhum ponto de entrada na UI, mas ficava alcançável por URL
// direta e por itens salvos no localStorage de antes da mudança, levando a um "Finalizar
// compra" que nunca entregava o arquivo (não há mais handler de download no site).
export const Route = createFileRoute("/carrinho")({
  beforeLoad: () => {
    throw redirect({ to: "/produtos" });
  },
  component: CartPage,
});

const inputClass =
  "h-11 w-full border border-input bg-transparent px-4 text-sm placeholder:text-muted-foreground focus:border-accent-foreground focus:outline-none";

type PaymentMethod = "PIX" | "BOLETO" | "CREDIT_CARD";

type PendingPayment = {
  orderId: string;
  status: string;
  paymentMethod?: PaymentMethod;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixPayload?: string;
  pixQrCodeImage?: string;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "PIX", label: "Pix" },
  { value: "BOLETO", label: "Boleto" },
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
];

function CartPage() {
  const { detailed, subtotal, savings, remove, clear, add, has } = useCart();
  const { products } = useProductCatalog();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<PendingPayment | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [payer, setPayer] = useState({ name: "", email: "", cpfCnpj: "", phone: "" });
  const [card, setCard] = useState({
    number: "",
    holderName: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
    postalCode: "",
    addressNumber: "",
  });

  useEffect(() => {
    if (!user) return;
    setPayer((p) => ({
      ...p,
      name: p.name || user.displayName || "",
      email: p.email || user.email || "",
    }));
  }, [user]);

  useEffect(() => {
    if (!pending || pending.status !== "pending" || !user) return;
    const interval = setInterval(async () => {
      try {
        const idToken = await user.getIdToken();
        const { status } = await getOrderStatus({ data: { idToken, orderId: pending.orderId } });
        if (status === "paid") {
          setPending(null);
          setDone(true);
        }
      } catch {
        /* keep polling silently */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pending, user]);

  const upsells = products
    .filter((p) => !has(p.slug) && p.category === detailed[0]?.product.category)
    .slice(0, 3);

  const total = Math.max(subtotal - discount, 0);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "VERTICE10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success("Cupom aplicado", { description: "10% de desconto" });
    } else {
      toast.error("Cupom inválido");
    }
  };

  const finalizarCompra = async () => {
    if (!user) {
      toast.info("Entre na sua conta para finalizar a compra");
      navigate({ to: "/entrar" });
      return;
    }

    if (total > 0) {
      if (
        !payer.name.trim() ||
        !payer.email.trim() ||
        !payer.cpfCnpj.trim() ||
        !payer.phone.trim()
      ) {
        toast.error("Preencha nome, e-mail, CPF/CNPJ e telefone para continuar.");
        return;
      }
      if (
        paymentMethod === "CREDIT_CARD" &&
        (!card.number.trim() ||
          !card.holderName.trim() ||
          !card.expiryMonth.trim() ||
          !card.expiryYear.trim() ||
          !card.ccv.trim() ||
          !card.postalCode.trim() ||
          !card.addressNumber.trim())
      ) {
        toast.error("Preencha todos os dados do cartão.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const response = await createOrder({
        data: {
          idToken,
          items: detailed.map(({ product, qty }) => ({ slug: product.slug, qty })),
          couponCode: coupon.trim() || undefined,
          ...(total > 0
            ? {
                paymentMethod,
                payer,
                ...(paymentMethod === "CREDIT_CARD" ? { creditCard: card } : {}),
              }
            : {}),
        },
      });
      clear();
      if (response.status === "paid") {
        setDone(true);
      } else {
        setPending(response as PendingPayment);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível finalizar a compra.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPixCode = async () => {
    if (!pending?.pixPayload) return;
    try {
      await navigator.clipboard.writeText(pending.pixPayload);
      toast.success("Código Pix copiado");
    } catch {
      toast.error("Não foi possível copiar o código");
    }
  };

  if (done) {
    return (
      <section className="band-dark">
        <div className="container-editorial flex min-h-screen flex-col items-center justify-center py-40 text-center">
          <p className="label-micro text-primary">Pedido aprovado</p>
          <h1 className="display-section mt-8 max-w-2xl">Acesso liberado</h1>
          <p className="mt-6 max-w-md text-sm text-muted-foreground">
            Os arquivos ficam disponíveis na sua área de downloads com links temporários e seguros.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild variant="champagne" size="editorial">
              <Link to="/conta">Ir para downloads</Link>
            </Button>
            <Button asChild variant="hairline" size="editorial">
              <Link to="/produtos">Continuar no catálogo</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (pending) {
    return (
      <section className="band-dark">
        <div className="container-editorial flex min-h-screen flex-col items-center justify-center py-40 text-center">
          <p className="label-micro text-primary">Aguardando pagamento</p>
          <h1 className="display-section mt-8 max-w-2xl">
            {pending.paymentMethod === "PIX"
              ? "Escaneie ou copie o código Pix"
              : "Seu boleto foi gerado"}
          </h1>

          {pending.paymentMethod === "PIX" && pending.pixQrCodeImage && (
            <>
              <img
                src={`data:image/png;base64,${pending.pixQrCodeImage}`}
                alt="QR Code Pix"
                className="mt-10 h-56 w-56 bg-white p-2"
              />
              <Button variant="hairline" size="editorial" className="mt-6" onClick={copyPixCode}>
                Copiar código Pix
              </Button>
            </>
          )}

          {pending.paymentMethod === "BOLETO" && (
            <Button asChild variant="champagne" size="editorial" className="mt-10">
              <a href={pending.bankSlipUrl ?? pending.invoiceUrl} target="_blank" rel="noreferrer">
                Abrir boleto
              </a>
            </Button>
          )}

          <p className="mt-8 max-w-md text-sm text-muted-foreground">
            Assim que o pagamento for confirmado, o acesso é liberado automaticamente nesta página —
            não precisa recarregar.
          </p>
          <Button asChild variant="hairline" size="editorial" className="mt-8">
            <Link to="/conta">Ver meus pedidos</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="band-dark border-b border-border">
        <div className="container-editorial pt-40 pb-16 lg:pt-48 lg:pb-20">
          <p className="label-micro text-primary">Checkout</p>
          <h1 className="display-hero mt-8">Seu carrinho</h1>
        </div>
      </section>

      <section className="band-light">
        <div className="container-editorial grid gap-16 py-20 lg:grid-cols-[1.4fr_1fr] lg:py-28">
          <div>
            {detailed.length === 0 ? (
              <div className="border border-border p-12">
                <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
                <Button asChild variant="ink" size="editorial" className="mt-8">
                  <Link to="/produtos">Explorar produtos</Link>
                </Button>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-border border-y border-border">
                  {detailed.map(({ product }) => (
                    <li key={product.slug} className="flex gap-6 py-8">
                      <img
                        src={product.image}
                        alt={`Mockup do ${product.name}`}
                        loading="lazy"
                        width={1200}
                        height={912}
                        className="h-24 w-32 shrink-0 object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <span className="label-micro text-accent-foreground">{product.type}</span>
                        <Link
                          to="/produtos/$slug"
                          params={{ slug: product.slug }}
                          className="link-underline mt-2 self-start text-lg"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => remove(product.slug)}
                          className="label-micro mt-auto self-start text-muted-foreground hover:text-foreground"
                        >
                          Remover
                        </button>
                      </div>
                      <span className="font-display text-xl">{brl(product.price)}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={clear}
                  className="label-micro mt-6 text-muted-foreground hover:text-foreground"
                >
                  Esvaziar carrinho
                </button>

                {upsells.length > 0 && (
                  <div className="mt-16">
                    <p className="label-micro text-accent-foreground">Complete sua solução</p>
                    <ul className="mt-6 divide-y divide-border border-y border-border">
                      {upsells.map((p) => (
                        <li key={p.slug} className="flex items-center justify-between gap-6 py-5">
                          <span className="text-sm">{p.name}</span>
                          <button
                            onClick={() => {
                              add(p.slug);
                              toast.success("Adicionado ao carrinho", { description: p.name });
                            }}
                            className="label-micro text-accent-foreground hover:text-foreground"
                          >
                            + {brl(p.price)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {total > 0 && (
                  <div className="mt-16 border border-border p-8">
                    <p className="label-micro text-accent-foreground">Dados para pagamento</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        placeholder="Nome completo"
                        value={payer.name}
                        onChange={(e) => setPayer((p) => ({ ...p, name: e.target.value }))}
                      />
                      <input
                        className={inputClass}
                        placeholder="E-mail"
                        type="email"
                        value={payer.email}
                        onChange={(e) => setPayer((p) => ({ ...p, email: e.target.value }))}
                      />
                      <input
                        className={inputClass}
                        placeholder="CPF ou CNPJ"
                        value={payer.cpfCnpj}
                        onChange={(e) => setPayer((p) => ({ ...p, cpfCnpj: e.target.value }))}
                      />
                      <input
                        className={inputClass}
                        placeholder="Telefone com DDD"
                        value={payer.phone}
                        onChange={(e) => setPayer((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>

                    <p className="label-micro mt-8 text-accent-foreground">Forma de pagamento</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setPaymentMethod(m.value)}
                          className={`h-11 border px-5 text-sm transition-colors ${
                            paymentMethod === m.value
                              ? "border-accent-foreground bg-accent-foreground text-accent"
                              : "border-input text-muted-foreground hover:border-accent-foreground"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === "CREDIT_CARD" && (
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <input
                          className={`${inputClass} sm:col-span-2`}
                          placeholder="Número do cartão"
                          inputMode="numeric"
                          value={card.number}
                          onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                        />
                        <input
                          className={`${inputClass} sm:col-span-2`}
                          placeholder="Nome impresso no cartão"
                          value={card.holderName}
                          onChange={(e) => setCard((c) => ({ ...c, holderName: e.target.value }))}
                        />
                        <input
                          className={inputClass}
                          placeholder="Mês de validade (MM)"
                          inputMode="numeric"
                          value={card.expiryMonth}
                          onChange={(e) => setCard((c) => ({ ...c, expiryMonth: e.target.value }))}
                        />
                        <input
                          className={inputClass}
                          placeholder="Ano de validade (AAAA)"
                          inputMode="numeric"
                          value={card.expiryYear}
                          onChange={(e) => setCard((c) => ({ ...c, expiryYear: e.target.value }))}
                        />
                        <input
                          className={inputClass}
                          placeholder="CVV"
                          inputMode="numeric"
                          value={card.ccv}
                          onChange={(e) => setCard((c) => ({ ...c, ccv: e.target.value }))}
                        />
                        <input
                          className={inputClass}
                          placeholder="CEP de cobrança"
                          inputMode="numeric"
                          value={card.postalCode}
                          onChange={(e) => setCard((c) => ({ ...c, postalCode: e.target.value }))}
                        />
                        <input
                          className={inputClass}
                          placeholder="Número do endereço"
                          value={card.addressNumber}
                          onChange={(e) =>
                            setCard((c) => ({ ...c, addressNumber: e.target.value }))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <Reveal className="h-fit border border-border p-8 lg:sticky lg:top-32 lg:p-10">
            <p className="label-micro text-accent-foreground">Resumo</p>
            <dl className="mt-8 space-y-4 border-b border-border pb-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{brl(subtotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Economia do catálogo</dt>
                  <dd>−{brl(savings)}</dd>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Cupom</dt>
                  <dd>−{brl(discount)}</dd>
                </div>
              )}
            </dl>
            <div className="mt-6 flex items-baseline justify-between">
              <span className="label-micro">Total</span>
              <span className="font-display text-3xl">{brl(total)}</span>
            </div>

            <div className="mt-8 flex gap-2">
              <label className="sr-only" htmlFor="cupom">
                Cupom de desconto
              </label>
              <input
                id="cupom"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Cupom"
                className="h-11 flex-1 border border-input bg-transparent px-4 text-sm placeholder:text-muted-foreground focus:border-accent-foreground focus:outline-none"
              />
              <Button variant="hairline" onClick={applyCoupon} className="h-11">
                Aplicar
              </Button>
            </div>

            <Button
              variant="ink"
              size="editorial"
              className="mt-8 w-full"
              disabled={detailed.length === 0 || submitting}
              onClick={finalizarCompra}
            >
              {submitting ? "Finalizando…" : "Finalizar compra"}
            </Button>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Entrega digital imediata por link seguro e temporário. Ao continuar você concorda com
              os{" "}
              <Link to="/termos-de-uso" className="link-underline text-foreground">
                termos de uso
              </Link>{" "}
              e a{" "}
              <Link to="/politica-de-privacidade" className="link-underline text-foreground">
                política de privacidade
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
