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

export interface DeleteDraftDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDraftDialog({ open, onConfirm, onCancel }: DeleteDraftDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent data-testid="delete-draft-dialog">
        <DialogHeader>
          <DialogTitle>Supprimer le brouillon</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Le brouillon et toutes les données associées (photos,
            champs certifiés) seront définitivement supprimés.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} data-testid="delete-cancel-btn">
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} data-testid="delete-confirm-btn">
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
