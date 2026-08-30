import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authErrorMessage, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Vértice" },
      { name: "description", content: "Crie sua conta Vértice para comprar e acessar seus produtos." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cadastro" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signUp(name, email, password);
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
        <h1 className="display-section mt-6">Criar conta</h1>

        <form onSubmit={handleSubmit} className="mt-12 space-y-5">
          <div>
            <label htmlFor="name" className="label-micro text-paper-warm/70">
              Nome
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 h-11 w-full border border-border bg-transparent px-4 text-sm text-paper-warm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
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
            <label htmlFor="password" className="label-micro text-paper-warm/70">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
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
            Criar conta
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
          Já tem conta?{" "}
          <Link to="/entrar" className="link-underline text-paper-warm">
            Entrar
          </Link>
        </p>
      </div>
    </section>
  );
}
