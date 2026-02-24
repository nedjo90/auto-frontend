"use client";

import { useEffect, useRef, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Loader2 } from "lucide-react";

/**
 * Validates that a return URL is a safe relative path (no open redirect).
 */
function isSafeReturnUrl(url: string): boolean {
  if (!url) return false;
  // Must start with / and not with // (protocol-relative URL)
  if (!url.startsWith("/") || url.startsWith("//")) return false;
  try {
    const parsed = new URL(url, "http://localhost");
    return parsed.hostname === "localhost";
  } catch {
    return false;
  }
}

export default function AuthCallbackPage() {
  const { instance, accounts } = useMsal();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    // Prevent double-execution from accounts reference changes (M9)
    if (handledRef.current) return;
    handledRef.current = true;

    let redirectTimeout: ReturnType<typeof setTimeout> | undefined;

    instance
      .handleRedirectPromise()
      .then((response) => {
        if (response?.account) {
          instance.setActiveAccount(response.account);
          // H2: Validate return URL to prevent open redirect
          const returnUrl =
            response.state && isSafeReturnUrl(response.state) ? response.state : "/dashboard";
          window.location.href = returnUrl;
        } else if (accounts.length > 0) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        setError("Échec de l'authentification. Veuillez réessayer.");
        // M3: Store timeout ref for cleanup
        redirectTimeout = setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      });

    return () => {
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
      {error ? (
        <>
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
          <p className="text-xs text-muted-foreground">Redirection vers la page de connexion...</p>
        </>
      ) : (
        <>
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Authentification en cours...</p>
        </>
      )}
    </div>
  );
}
