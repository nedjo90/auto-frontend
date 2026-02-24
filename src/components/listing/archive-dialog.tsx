"use client";

import { useState, useEffect } from "react";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

interface ArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingTitle: string;
  onConfirm: () => Promise<void>;
}

export function ArchiveDialog({ open, onOpenChange, listingTitle, onConfirm }: ArchiveDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) setIsLoading(false);
  }, [open]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-muted-foreground" />
            Retirer l&apos;annonce
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Retirer <strong>{listingTitle}</strong> ? Elle ne sera plus visible publiquement. Cette
            action est irreversible.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "En cours..." : "Retirer l'annonce"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
