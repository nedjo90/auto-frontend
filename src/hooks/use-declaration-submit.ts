"use client";

import { useCallback, useState } from "react";
import { submitDeclaration } from "@/lib/api/declaration-api";
import { useListingStore } from "@/stores/listing-store";
import { toast } from "sonner";

export interface DeclarationState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  declarationId: string | null;
  signedAt: string | null;
  error: string | null;
}

export function useDeclarationSubmit() {
  const listingId = useListingStore((s) => s.listingId);
  const [state, setState] = useState<DeclarationState>({
    isSubmitting: false,
    isSubmitted: false,
    declarationId: null,
    signedAt: null,
    error: null,
  });

  const handleSubmit = useCallback(
    async (checkboxStates: Array<{ label: string; checked: boolean }>) => {
      if (!listingId) {
        setState((prev) => ({
          ...prev,
          error: "Veuillez d'abord sauvegarder le brouillon",
        }));
        return;
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        const result = await submitDeclaration({
          listingId,
          checkboxStates,
        });

        if (result.success) {
          setState({
            isSubmitting: false,
            isSubmitted: true,
            declarationId: result.declarationId,
            signedAt: result.signedAt,
            error: null,
          });
          toast.success("Déclaration signée avec succès");
        } else {
          throw new Error("La soumission a échoué");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la signature";
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          error: message,
        }));
        toast.error(message, {
          action: {
            label: "Réessayer",
            onClick: () => handleSubmit(checkboxStates),
          },
        });
      }
    },
    [listingId],
  );

  const reset = useCallback(() => {
    setState({
      isSubmitting: false,
      isSubmitted: false,
      declarationId: null,
      signedAt: null,
      error: null,
    });
  }, []);

  return { ...state, handleSubmit, reset };
}
