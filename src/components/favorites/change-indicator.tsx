"use client";

import { ArrowDown, ArrowUp, Camera, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { IFavoriteChanges } from "@auto/shared";
import { formatPrice } from "@/lib/api/catalog-api";

interface ChangeIndicatorProps {
  changes: IFavoriteChanges;
}

/**
 * Renders change badges for a favorited listing.
 * Shows price changes, new photos, and certification updates.
 */
export function ChangeIndicator({ changes }: ChangeIndicatorProps) {
  const hasChanges =
    changes.priceChanged || changes.photosAdded > 0 || changes.certificationChanged;

  if (!hasChanges) return null;

  return (
    <div className="flex flex-wrap gap-1.5" data-testid="change-indicator">
      {changes.priceChanged && (
        <Badge
          variant="secondary"
          className={
            changes.newPrice != null &&
            changes.oldPrice != null &&
            changes.newPrice < changes.oldPrice
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }
          data-testid="change-price"
        >
          {changes.newPrice != null &&
          changes.oldPrice != null &&
          changes.newPrice < changes.oldPrice ? (
            <ArrowDown className="mr-1 h-3 w-3" />
          ) : (
            <ArrowUp className="mr-1 h-3 w-3" />
          )}
          Prix : {formatPrice(changes.oldPrice)} → {formatPrice(changes.newPrice)}
        </Badge>
      )}
      {changes.photosAdded > 0 && (
        <Badge variant="secondary" data-testid="change-photos">
          <Camera className="mr-1 h-3 w-3" />+{changes.photosAdded} photo
          {changes.photosAdded > 1 ? "s" : ""}
        </Badge>
      )}
      {changes.certificationChanged && (
        <Badge variant="secondary" data-testid="change-certification">
          <ShieldCheck className="mr-1 h-3 w-3" />
          Certification mise à jour
        </Badge>
      )}
    </div>
  );
}
