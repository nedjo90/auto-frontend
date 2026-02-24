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

export interface DeleteDraftDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDraftDialog({ open, onConfirm, onCancel }: DeleteDraftDialogProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <ResponsiveDialogContent data-testid="delete-draft-dialog">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Supprimer le brouillon</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Cette action est irréversible. Le brouillon et toutes les données associées (photos,
            champs certifiés) seront définitivement supprimés.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={onCancel} data-testid="delete-cancel-btn">
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} data-testid="delete-confirm-btn">
            Supprimer
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
