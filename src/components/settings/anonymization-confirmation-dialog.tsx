"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ANONYMIZATION_CONFIRMATION_WORD } from "@auto/shared";
import { apiClient } from "@/lib/auth/api-client";
import { useAuth } from "@/hooks/use-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface AnonymizationConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnonymizationConfirmationDialog({
  open,
  onOpenChange,
}: AnonymizationConfirmationDialogProps) {
  const { logout } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmTextValid = confirmText === ANONYMIZATION_CONFIRMATION_WORD;

  function handleClose() {
    setStep(1);
    setConfirmText("");
    setError(null);
    onOpenChange(false);
  }

  async function handleConfirm() {
    if (step === 1) {
      if (!isConfirmTextValid) return;
      setStep(2);
      return;
    }

    // Step 2: Execute anonymization
    setLoading(true);
    setError(null);
    try {
      // Request anonymization
      const reqRes = await apiClient(`${API_BASE}/api/rgpd/requestAnonymization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!reqRes.ok) throw new Error("Erreur lors de la demande d'anonymisation");
      const reqData = await reqRes.json();

      // Confirm anonymization
      const confirmRes = await apiClient(`${API_BASE}/api/rgpd/confirmAnonymization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: reqData.requestId,
          confirmationCode: reqData.requestId, // The code is embedded in the request flow
        }),
      });

      if (!confirmRes.ok) {
        const body = await confirmRes
          .json()
          .catch(() => ({ error: { message: "Erreur serveur" } }));
        throw new Error(body.error?.message || "Erreur lors de l'anonymisation");
      }

      // Success - logout and redirect
      handleClose();
      logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {step === 1 ? "Confirmer l'anonymisation" : "Dernière confirmation"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Êtes-vous sûr ? Cette action est irréversible. Toutes vos données personnelles seront définitivement anonymisées."
              : "Dernière confirmation. Toutes vos données personnelles seront anonymisées et votre compte sera désactivé."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3 py-2">
            <Label htmlFor="confirm-text">
              Tapez <strong>{ANONYMIZATION_CONFIRMATION_WORD}</strong> pour confirmer
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={ANONYMIZATION_CONFIRMATION_WORD}
              aria-invalid={confirmText.length > 0 && !isConfirmTextValid}
            />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || (step === 1 && !isConfirmTextValid)}
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {step === 1 ? "Continuer" : "Anonymiser définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
