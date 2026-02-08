"use client";

import { useState, useEffect } from "react";
import { Loader2, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function SecuritySettingsPage() {
  const { hasRole } = useAuth();
  const isSeller = hasRole("private_seller") || hasRole("professional_seller");

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: fetch current MFA status from backend when API is available
  }, []);

  async function handleToggle2FA() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient(`${API_BASE}/api/security/toggle2FA`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable: !mfaEnabled }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Erreur lors de la mise à jour");
      }
      setMfaEnabled(result.mfaStatus === "enabled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du 2FA");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sécurité</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les paramètres de sécurité de votre compte
        </p>
      </div>

      {isSeller && (
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {mfaEnabled ? (
                <ShieldCheck className="mt-1 size-6 text-green-500" />
              ) : (
                <Shield className="mt-1 size-6 text-muted-foreground" />
              )}
              <div className="space-y-1">
                <h2 className="font-semibold">Authentification à deux facteurs (2FA)</h2>
                <p className="text-sm text-muted-foreground">
                  {mfaEnabled
                    ? "La vérification en deux étapes est activée. Votre compte bénéficie d'une sécurité renforcée."
                    : "Ajoutez une couche de sécurité supplémentaire à votre compte professionnel."}
                </p>
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant={mfaEnabled ? "outline" : "default"}
              onClick={handleToggle2FA}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : mfaEnabled ? (
                "Désactiver"
              ) : (
                "Activer"
              )}
            </Button>
          </div>
        </Card>
      )}

      {!isSeller && (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            L&apos;authentification à deux facteurs est disponible pour les comptes vendeurs.
          </p>
        </Card>
      )}
    </div>
  );
}
