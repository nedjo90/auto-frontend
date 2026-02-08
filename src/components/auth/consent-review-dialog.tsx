"use client";

import { useState } from "react";
import { useConsentStore } from "@/stores/consent-store";
import { ConsentStep, type ConsentDecisions } from "./consent-step";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth/get-auth-headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function ConsentReviewDialog() {
  const { pendingConsents, hasPendingConsents, clearPendingConsents } =
    useConsentStore();
  const [decisions, setDecisions] = useState<ConsentDecisions>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateAndSubmit = async () => {
    // Clear previous errors before re-validating
    setErrors({});

    // Validate mandatory consents
    const validationErrors: Record<string, string> = {};
    for (const ct of pendingConsents) {
      if (ct.isMandatory && !decisions[ct.ID]) {
        validationErrors[ct.ID] = "Ce consentement est requis";
      }
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const consents = pendingConsents.map((ct) => ({
        consentTypeId: ct.ID,
        decision: decisions[ct.ID] ? "granted" : "revoked",
      }));

      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${API_BASE}/api/consent/recordConsents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ input: { consents } }),
      });

      if (!res.ok) throw new Error("Failed to record consents");

      clearPendingConsents();
    } catch {
      setErrors({ _form: "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={hasPendingConsents}>
      <DialogContent showCloseButton={false} aria-describedby="consent-review-desc">
        <DialogHeader>
          <DialogTitle>Mise à jour des consentements</DialogTitle>
          <DialogDescription id="consent-review-desc">
            Nos conditions de traitement des données ont été mises à jour.
            Veuillez revoir vos choix avant de continuer.
          </DialogDescription>
        </DialogHeader>

        <ConsentStep
          consentTypes={pendingConsents}
          value={decisions}
          onChange={setDecisions}
          errors={errors}
          disabled={submitting}
        />

        {errors._form && (
          <p className="text-sm text-destructive" role="alert">
            {errors._form}
          </p>
        )}

        <DialogFooter>
          <Button onClick={validateAndSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Confirmer mes choix"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
