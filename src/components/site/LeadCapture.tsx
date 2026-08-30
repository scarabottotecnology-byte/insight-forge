import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/catalog";
import { captureLead } from "@/lib/leads";

export function LeadCapture({ magnetSlug, source }: { magnetSlug: string; source: string }) {
  const magnet = getProduct(magnetSlug);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!magnet) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await captureLead({ email, source, magnetSlug });
      setDone(true);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-border p-10 lg:p-14">
      {done ? (
        <>
          <p className="label-micro text-accent-foreground">Recebido</p>
          <h2 className="mt-6 max-w-xl text-2xl leading-tight lg:text-3xl">
            Confirmado. Enviaremos o acesso para {email} em breve.
          </h2>
        </>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="label-micro text-accent-foreground">Recurso gratuito</p>
            <h2 className="mt-6 max-w-xl text-2xl leading-tight lg:text-3xl">{magnet.name}</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {magnet.tagline}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="lead-email" className="sr-only">
              E-mail
            </label>
            <input
              id="lead-email"
              type="email"
              required
              placeholder="seu@e-mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 flex-1 border border-input bg-transparent px-4 text-sm placeholder:text-muted-foreground focus:border-accent-foreground focus:outline-none"
            />
            <Button type="submit" variant="ink" size="editorial" disabled={submitting} className="h-12">
              Quero receber
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
