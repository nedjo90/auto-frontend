"use client";

import { useCallback, useEffect, useState } from "react";
import type { IConfigConsentType, IUserConsent } from "@auto/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMsal } from "@azure/msal-react";
import { getAuthHeaders } from "@/lib/auth/get-auth-headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface ConsentStatus {
  consentType: IConfigConsentType;
  latestDecision: IUserConsent | null;
}

export default function ConsentSettingsPage() {
  const { accounts } = useMsal();
  const userId = accounts[0]?.localAccountId ?? null;
  const [statuses, setStatuses] = useState<ConsentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadConsentData = useCallback(async () => {
    if (!userId) return;
    try {
      const authHeaders = await getAuthHeaders();
      const encodedUserId = encodeURIComponent(userId);
      const [typesRes, consentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/consent/ActiveConsentTypes?$orderby=displayOrder asc`),
        fetch(`${API_BASE}/api/consent/getUserConsents(userId=${encodedUserId})`, {
          headers: { ...authHeaders },
        }),
      ]);

      if (!typesRes.ok || !consentsRes.ok) throw new Error("Failed to load consent data");

      const types: IConfigConsentType[] = (await typesRes.json()).value;
      const consentsData = await consentsRes.json();
      const consents: IUserConsent[] = consentsData.value ?? consentsData;

      // Build latest consent per type
      const latestByType = new Map<string, IUserConsent>();
      for (const c of consents) {
        if (!latestByType.has(c.consentType_ID)) {
          latestByType.set(c.consentType_ID, c);
        }
      }

      setStatuses(
        types.map((ct) => ({
          consentType: ct,
          latestDecision: latestByType.get(ct.ID) ?? null,
        })),
      );
    } catch {
      setError("Impossible de charger vos consentements");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadConsentData();
  }, [loadConsentData]);

  const toggleConsent = async (consentTypeId: string, grant: boolean) => {
    setSaving(consentTypeId);
    setError(null);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/consent/recordConsent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          input: {
            consentTypeId,
            decision: grant ? "granted" : "revoked",
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to update consent");
      await loadConsentData();
    } catch {
      setError("Erreur lors de la mise à jour du consentement");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12" role="status">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Chargement des consentements...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gestion des consentements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez et gérez vos choix de traitement des données personnelles.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {statuses.map(({ consentType: ct, latestDecision }) => {
          const isGranted = latestDecision?.decision === "granted";
          const isSaving = saving === ct.ID;

          return (
            <div
              key={ct.ID}
              className="rounded-lg border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`consent-setting-${ct.ID}`}
                    checked={isGranted}
                    onCheckedChange={(checked) =>
                      toggleConsent(ct.ID, checked === true)
                    }
                    disabled={ct.isMandatory || isSaving}
                    aria-label={ct.labelKey}
                  />
                  <div>
                    <Label
                      htmlFor={`consent-setting-${ct.ID}`}
                      className="font-medium"
                    >
                      {ct.labelKey}
                      {ct.isMandatory && (
                        <span className="ml-2 text-xs text-muted-foreground">(obligatoire)</span>
                      )}
                    </Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ct.descriptionKey}
                    </p>
                    {latestDecision && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isGranted ? "Accordé" : "Révoqué"} le{" "}
                        {new Date(latestDecision.timestamp).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
                {isSaving && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {ct.isMandatory && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Ce consentement est nécessaire au fonctionnement du service et ne peut pas être révoqué.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
