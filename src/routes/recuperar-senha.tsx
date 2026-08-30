import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authErrorMessage, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Vértice" },
      { name: "description", content: "Redefina a senha da sua conta Vértice." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/recuperar-senha" }],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="band-dark min-h-screen">
      <div className="container-editorial flex min-h-screen max-w-md flex-col justify-center py-40">
        <p className="label-micro text-primary">Minha conta</p>
        <h1 className="display-section mt-6">Recuperar senha</h1>

        {sent ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Se houver uma conta com o e-mail <span className="text-paper-warm">{email}</span>, enviamos
            um link para redefinir a senha.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 space-y-5">
            <div>
              <label htmlFor="email" className="label-micro text-paper-warm/70">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-11 w-full border border-border bg-transparent px-4 text-sm text-paper-warm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              variant="champagne"
              size="editorial"
              className="w-full"
              disabled={submitting}
            >
              Enviar link de recuperação
            </Button>
          </form>
        )}

        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link to="/entrar" className="link-underline text-paper-warm">
            Voltar para o login
          </Link>
        </p>
      </div>
    </section>
  );
}
