"use client";

import { Button } from "@/components/ui/button";
import { useListingStore } from "@/stores/listing-store";
import { useDraftSave } from "@/hooks/use-draft-save";
import { Loader2 } from "lucide-react";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Sticky footer with save draft button, auto-save indicator, and last saved timestamp.
 */
export function DraftSaveFooter() {
  const { handleManualSave, isSaving, isDirty } = useDraftSave();
  const lastSavedAt = useListingStore((s) => s.lastSavedAt);
  const completionPercentage = useListingStore((s) => s.completionPercentage);

  return (
    <footer
      className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur px-4 py-3"
      data-testid="draft-save-footer"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {isSaving && (
            <span className="flex items-center gap-1.5" data-testid="auto-save-indicator">
              <Loader2 className="size-3.5 animate-spin" />
              Sauvegarde automatique...
            </span>
          )}
          {!isSaving && lastSavedAt && (
            <span data-testid="last-saved-at">Dernière sauvegarde : {formatTime(lastSavedAt)}</span>
          )}
          {completionPercentage > 0 && (
            <span data-testid="completion-pct">{completionPercentage}% complété</span>
          )}
        </div>

        <Button
          onClick={handleManualSave}
          disabled={!isDirty || isSaving}
          data-testid="save-draft-btn"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            "Sauvegarder le brouillon"
          )}
        </Button>
      </div>
    </footer>
  );
}
