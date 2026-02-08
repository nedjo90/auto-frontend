"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginRedirect } from "@/lib/auth/auth-utils";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    try {
      setIsLoading(true);
      setError(null);
      await loginRedirect();
    } catch {
      setError("Une erreur est survenue lors de la connexion.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-bold">Connexion</h1>
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour accéder à votre compte
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          "Se connecter"
        )}
      </Button>

      <p className="text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
