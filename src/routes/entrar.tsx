import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authErrorMessage, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Vértice" },
      { name: "description", content: "Acesse sua conta Vértice." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/entrar" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate({ to: "/conta" });
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      navigate({ to: "/conta" });
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
        <h1 className="display-section mt-6">Entrar</h1>

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
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="label-micro text-paper-warm/70">
                Senha
              </label>
              <Link to="/recuperar-senha" className="link-underline text-xs text-muted-foreground">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            Entrar
          </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="label-micro text-muted-foreground">ou</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          variant="hairline"
          size="editorial"
          className="w-full text-paper-warm"
          onClick={handleGoogle}
          disabled={submitting}
        >
          Continuar com Google
        </Button>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="link-underline text-paper-warm">
            Criar conta
          </Link>
        </p>
      </div>
    </section>
  );
}
