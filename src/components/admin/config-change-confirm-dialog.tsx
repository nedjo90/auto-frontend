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
import { Loader2 } from "lucide-react";

export interface ConfigChange {
  field: string;
  oldValue: string;
  newValue: string;
}

interface ConfigChangeConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: ConfigChange[];
  impactMessage?: string | null;
  loading?: boolean;
  title?: string;
}

export function ConfigChangeConfirmDialog({
  open,
  onClose,
  onConfirm,
  changes,
  impactMessage,
  loading = false,
  title = "Confirmer les modifications",
}: ConfigChangeConfirmDialogProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={(v) => !v && !loading && onClose()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Veuillez verifier les modifications avant de confirmer.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-3 py-2">
          {changes.map((change, i) => (
            <div key={i} className="rounded-md border p-3">
              <p className="text-sm font-medium">{change.field}</p>
              <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Avant : </span>
                  <span className="text-destructive">{change.oldValue || "(vide)"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Apres : </span>
                  <span className="text-green-600">{change.newValue || "(vide)"}</span>
                </div>
              </div>
            </div>
          ))}

          {impactMessage && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
              {impactMessage}
            </div>
          )}
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Confirmer
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
