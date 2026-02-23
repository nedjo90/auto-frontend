"use client";

import { useCallback, useRef } from "react";
import { useListingStore } from "@/stores/listing-store";
import type { UpdateListingFieldResult, FieldStatus } from "@auto/shared";

const DEBOUNCE_MS = 300;

/**
 * Hook for updating listing fields with backend sync and debounced score updates.
 */
export function useListingField() {
  const { listingId, updateField, setVisibilityScore, setLoading, setOriginalCertifiedValue } =
    useListingStore();
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const updateFieldOnBackend = useCallback(
    async (fieldName: string, value: string): Promise<UpdateListingFieldResult | null> => {
      if (!listingId) return null;

      try {
        const response = await fetch("/api/seller/updateListingField", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, fieldName, value }),
        });

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ error: { message: "Erreur serveur" } }));
          throw new Error(error.error?.message || "Erreur lors de la mise à jour");
        }

        const result: UpdateListingFieldResult = await response.json();
        return result;
      } catch (err) {
        console.error(`Failed to update field ${fieldName}:`, err);
        return null;
      }
    },
    [listingId],
  );

  /**
   * Handle field value change with optimistic UI update and debounced backend sync.
   */
  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      // Optimistic UI update
      const status: FieldStatus = value === "" ? "empty" : "declared";
      updateField(fieldName, value, status);

      // Debounce backend call
      if (debounceTimers.current[fieldName]) {
        clearTimeout(debounceTimers.current[fieldName]);
      }

      debounceTimers.current[fieldName] = setTimeout(async () => {
        setLoading(true);
        const result = await updateFieldOnBackend(fieldName, value);
        if (result) {
          setVisibilityScore(result.visibilityScore);
          if (result.previousCertifiedValue) {
            setOriginalCertifiedValue(fieldName, result.previousCertifiedValue);
          }
        }
        setLoading(false);
      }, DEBOUNCE_MS);
    },
    [updateField, updateFieldOnBackend, setVisibilityScore, setLoading, setOriginalCertifiedValue],
  );

  /**
   * Handle certified field override.
   * Calls backend to override, updates local state.
   */
  const handleCertifiedOverride = useCallback(
    async (fieldName: string) => {
      if (!listingId) return;

      // The override flow: user clicks "Modifier" -> field becomes editable
      // The actual backend override happens when the user types a new value
      // For now, just change the status to "declared" locally
      const currentField = useListingStore.getState().getFieldState(fieldName);
      if (currentField) {
        updateField(fieldName, currentField.value, "declared");
        if (currentField.value) {
          setOriginalCertifiedValue(fieldName, String(currentField.value));
        }
      }
    },
    [listingId, updateField, setOriginalCertifiedValue],
  );

  return {
    handleFieldChange,
    handleCertifiedOverride,
  };
}
