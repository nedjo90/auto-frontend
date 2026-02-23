"use client";

import { useEffect, useRef, useState } from "react";
import { useListingStore } from "@/stores/listing-store";
import { usePhotoStore } from "@/stores/photo-store";
import { loadDraft } from "@/lib/api/draft-api";
import { LISTING_FIELDS } from "@auto/shared";
import type { ListingFieldState, FieldStatus } from "@auto/shared";
import type { PhotoItem } from "@/stores/photo-store";

export interface UseDraftRestoreResult {
  isRestoring: boolean;
  error: string | null;
}

/**
 * Hook to restore a draft listing by loading data from the backend
 * and populating the listing store and photo store.
 */
export function useDraftRestore(draftId: string | null): UseDraftRestoreResult {
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRestored = useRef(false);

  const {
    setListingId,
    setVisibilityScore,
    setVisibilityLabel,
    setCompletionPercentage,
    setDirty,
    setLoading,
  } = useListingStore();

  const setPhotos = usePhotoStore((s) => s.setPhotos);

  useEffect(() => {
    if (!draftId || hasRestored.current) return;
    hasRestored.current = true;

    const restore = async () => {
      setIsRestoring(true);
      setLoading(true);
      setError(null);

      try {
        const result = await loadDraft(draftId);

        // Parse listing JSON
        const listing = JSON.parse(result.listing || "{}");

        // Set listing ID
        setListingId(draftId);

        // Build field states from listing data
        const certifiedFields = JSON.parse(result.certifiedFields || "[]") as Array<{
          fieldName: string;
          fieldValue: string;
          source: string;
          sourceTimestamp: string;
        }>;

        const certifiedMap = new Map(certifiedFields.map((cf) => [cf.fieldName, cf]));

        const fields: Record<string, ListingFieldState> = {};
        for (const fieldMeta of LISTING_FIELDS) {
          const name = fieldMeta.fieldName;
          const value = listing[name] ?? null;
          const certified = certifiedMap.get(name);

          let status: FieldStatus = "empty";
          if (certified) {
            status = "certified";
          } else if (value != null && value !== "" && value !== 0) {
            status = "declared";
          }

          fields[name] = {
            fieldName: name,
            value,
            status,
            ...(certified
              ? {
                  certifiedSource: certified.source,
                  certifiedTimestamp: certified.sourceTimestamp,
                }
              : {}),
          };
        }

        // Set all fields at once
        useListingStore.setState({ fields });

        // Set scores from listing
        setVisibilityScore(listing.visibilityScore || 0);
        setVisibilityLabel(listing.visibilityLabel || "Partiellement documenté");
        setCompletionPercentage(listing.completionPercentage || 0);

        // Parse and set photos
        const photos = JSON.parse(result.photos || "[]") as Array<{
          ID: string;
          cdnUrl: string;
          sortOrder: number;
          isPrimary: boolean;
          fileSize: number;
          mimeType: string;
          width: number;
          height: number;
        }>;

        const photoItems: PhotoItem[] = photos.map((p) => ({
          id: p.ID,
          cdnUrl: p.cdnUrl,
          sortOrder: p.sortOrder,
          isPrimary: p.isPrimary,
          fileSize: p.fileSize,
          mimeType: p.mimeType,
          width: p.width,
          height: p.height,
          uploadStatus: "success" as const,
          uploadProgress: 100,
        }));
        setPhotos(photoItems);

        // Mark as clean baseline (no unsaved changes yet)
        setDirty(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement du brouillon");
      } finally {
        setIsRestoring(false);
        setLoading(false);
      }
    };

    restore();
  }, [
    draftId,
    setListingId,
    setVisibilityScore,
    setVisibilityLabel,
    setCompletionPercentage,
    setDirty,
    setLoading,
    setPhotos,
  ]);

  return { isRestoring, error };
}
