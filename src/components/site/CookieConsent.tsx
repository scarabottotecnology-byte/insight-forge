import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "vertice.cookie-consent.v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* ignore */
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="band-dark fixed inset-x-0 bottom-0 z-50 border-t border-border">
      <div className="container-editorial flex flex-col items-start gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          Usamos cookies essenciais para o funcionamento do site e, com seu consentimento, cookies de
          análise de audiência. Saiba mais na{" "}
          <Link to="/politica-de-privacidade" className="link-underline text-paper-warm">
            Política de Privacidade
          </Link>
          .
        </p>
        <Button variant="champagne" onClick={accept} className="shrink-0">
          Aceitar
        </Button>
      </div>
    </div>
  );
}
