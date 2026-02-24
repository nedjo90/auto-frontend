"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
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
    <ResponsiveDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <ResponsiveDialogContent data-testid="override-confirm-dialog">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Modifier la valeur certifiée</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            La valeur certifiée sera remplacée par votre saisie.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

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

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={onCancel} data-testid="override-cancel-btn">
            Annuler
          </Button>
          <Button onClick={onConfirm} data-testid="override-confirm-btn">
            Modifier
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
