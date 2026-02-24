"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { DeclarationForm } from "@/components/listing/declaration-form";
import { useDeclarationSubmit } from "@/hooks/use-declaration-submit";

export function DeclarationStep() {
  const { isSubmitting, isSubmitted, signedAt, error, handleSubmit } = useDeclarationSubmit();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStates, setPendingStates] = useState<Array<{ label: string; checked: boolean }>>(
    [],
  );

  const handleFormSubmit = useCallback(
    (checkboxStates: Array<{ label: string; checked: boolean }>) => {
      setPendingStates(checkboxStates);
      setShowConfirmDialog(true);
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    setShowConfirmDialog(false);
    await handleSubmit(pendingStates);
  }, [handleSubmit, pendingStates]);

  const handleCancel = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingStates([]);
  }, []);

  if (isSubmitted && signedAt) {
    const date = new Date(signedAt);
    const formatted = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const time = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="flex flex-col items-center gap-4 py-8" data-testid="declaration-success">
        <CheckCircle2 className="size-12 text-green-600" />
        <h3 className="text-lg font-semibold">Déclaration signée</h3>
        <p className="text-sm text-muted-foreground" data-testid="declaration-signed-date">
          Déclaration signée le {formatted} à {time}
        </p>
        <p className="text-xs text-muted-foreground">
          Cette déclaration est archivée et ne peut plus être modifiée.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          className="flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm"
          data-testid="declaration-submit-error"
        >
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <DeclarationForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent data-testid="declaration-confirm-dialog">
          <DialogHeader>
            <DialogTitle>Confirmer la signature</DialogTitle>
            <DialogDescription>
              En signant, vous attestez solennellement de l&apos;exactitude des informations. Cette
              déclaration est archivée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} data-testid="declaration-cancel-btn">
              Annuler
            </Button>
            <Button onClick={handleConfirm} data-testid="declaration-confirm-btn">
              Signer la déclaration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
