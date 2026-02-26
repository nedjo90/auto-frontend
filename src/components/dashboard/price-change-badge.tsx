"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/api/catalog-api";
import type { IListingPriceHistory } from "@auto/shared";

interface PriceChangeBadgeProps {
  priceHistory: IListingPriceHistory[];
}

/**
 * Shows the most recent price change as a colored badge.
 * Green for price decrease, red for price increase.
 */
export function PriceChangeBadge({ priceHistory }: PriceChangeBadgeProps) {
  if (priceHistory.length === 0) return null;

  const latest = priceHistory[0];
  if (latest.previousPrice == null) return null;

  const decreased = latest.price < latest.previousPrice;
  const diff = Math.abs(
    Math.round(((latest.price - latest.previousPrice) / latest.previousPrice) * 100),
  );

  return (
    <Badge
      variant="secondary"
      className={
        decreased
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }
      data-testid="price-change-badge"
    >
      {decreased ? <ArrowDown className="mr-1 h-3 w-3" /> : <ArrowUp className="mr-1 h-3 w-3" />}
      {formatPrice(latest.previousPrice)} → {formatPrice(latest.price)}
      {diff > 0 && ` (${decreased ? "-" : "+"}${diff}%)`}
    </Badge>
  );
}
