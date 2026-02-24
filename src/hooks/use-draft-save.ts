"use client";

import { useCallback, useRef, useEffect } from "react";
import { useListingStore } from "@/stores/listing-store";
import { saveDraft } from "@/lib/api/draft-api";
import { toast } from "sonner";

const AUTO_SAVE_INTERVAL_MS = 60_000;

/**
 * Hook for saving listing drafts with manual save + auto-save.
 */
export function useDraftSave() {
  const {
    isDirty,
    isSaving,
    setListingId,
    setDirty,
    setLastSavedAt,
    setSaving,
    setVisibilityScore,
    setVisibilityLabel,
    setCompletionPercentage,
  } = useListingStore();
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSavingRef = useRef(false);
  isSavingRef.current = isSaving;

  const performSave = useCallback(
    async (isAutoSave = false): Promise<boolean> => {
      if (isSavingRef.current) return false;

      const state = useListingStore.getState();
      const currentFields = state.fields;

      // Build fields object from store
      const fieldValues: Record<string, unknown> = {};
      for (const [key, fieldState] of Object.entries(currentFields)) {
        if (fieldState.value != null && fieldState.value !== "") {
          fieldValues[key] = fieldState.value;
        }
      }

      // Build certified fields array
      const certifiedFields = Object.values(currentFields)
        .filter((f) => f.status === "certified" && f.certifiedSource)
        .map((f) => ({
          fieldName: f.fieldName,
          fieldValue: String(f.value ?? ""),
          source: f.certifiedSource!,
          sourceTimestamp: f.certifiedTimestamp || new Date().toISOString(),
          isCertified: true,
        }));

      setSaving(true);

      try {
        const result = await saveDraft({
          listingId: state.listingId,
          fields: fieldValues,
          certifiedFields: certifiedFields.length > 0 ? certifiedFields : undefined,
        });

        if (result.success) {
          if (!state.listingId && result.listingId) {
            setListingId(result.listingId);
          }
          setVisibilityScore(result.visibilityScore);
          setVisibilityLabel(result.visibilityLabel);
          setCompletionPercentage(result.completionPercentage);
          setDirty(false);
          setLastSavedAt(new Date());

          if (!isAutoSave) {
            toast.success("Brouillon sauvegardé");
          }
          return true;
        }

        throw new Error("Save returned success=false");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
        if (!isAutoSave) {
          toast.error(message, {
            action: {
              label: "Réessayer",
              onClick: () => performSave(false),
            },
          });
        } else {
          console.error("Auto-save failed:", err);
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      setSaving,
      setListingId,
      setVisibilityScore,
      setVisibilityLabel,
      setCompletionPercentage,
      setDirty,
      setLastSavedAt,
    ],
  );

  const handleManualSave = useCallback(() => performSave(false), [performSave]);

  // Auto-save: check every AUTO_SAVE_INTERVAL_MS if dirty
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      const state = useListingStore.getState();
      if (state.isDirty && !state.isSaving) {
        performSave(true);
      }
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      if (autoSaveTimer.current) {
        clearInterval(autoSaveTimer.current);
      }
    };
  }, [performSave]);

  return {
    handleManualSave,
    isSaving,
    isDirty,
  };
}
