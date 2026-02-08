"use client";

import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const { instance, accounts } = useMsal();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    instance
      .handleRedirectPromise()
      .then((response) => {
        if (response?.account) {
          instance.setActiveAccount(response.account);
          const returnUrl = response.state || "/dashboard";
          window.location.href = returnUrl;
        } else if (accounts.length > 0) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        setError("Échec de l'authentification. Veuillez réessayer.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      });
  }, [instance, accounts]);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {error ? (
        <>
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
          <p className="text-xs text-muted-foreground">
            Redirection vers la page de connexion...
          </p>
        </>
      ) : (
        <>
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Authentification en cours...
          </p>
        </>
      )}
    </div>
  );
}
