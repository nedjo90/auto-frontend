"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface OverrideConfirmDialogProps {
  open: boolean;
  fieldName: string;
  fieldLabel: string;
  certifiedValue: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog shown when a seller wants to override a certified field.
 * Warns that the certified value will be replaced by their input.
 */
export function OverrideConfirmDialog({
  open,
  fieldLabel,
  certifiedValue,
  onConfirm,
  onCancel,
}: OverrideConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent data-testid="override-confirm-dialog">
        <DialogHeader>
          <DialogTitle>Modifier la valeur certifiée</DialogTitle>
          <DialogDescription>
            La valeur certifiée sera remplacée par votre saisie.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <p className="text-sm">
            <span className="font-medium">{fieldLabel}</span> est actuellement certifié avec la
            valeur :
          </p>
          <p
            className="text-sm font-semibold bg-green-50 border border-green-200 rounded px-3 py-2"
            data-testid="certified-value-display"
          >
            {certifiedValue}
          </p>
          <p className="text-sm text-muted-foreground">
            En modifiant cette valeur, le champ passera de &quot;Certifié&quot; à &quot;Déclaré
            vendeur&quot;. La valeur certifiée originale sera conservée dans l&apos;historique.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} data-testid="override-cancel-btn">
            Annuler
          </Button>
          <Button onClick={onConfirm} data-testid="override-confirm-btn">
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
