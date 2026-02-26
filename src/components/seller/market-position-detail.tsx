"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, TrendingDown, TrendingUp, Minus, Info } from "lucide-react";
import type { ISellerListingPerformance } from "@auto/shared";

export interface MarketPositionDetailProps {
  listing: ISellerListingPerformance;
  onClose: () => void;
}

const POSITION_CONFIG: Record<
  string,
  { icon: typeof TrendingDown; color: string; suggestion: string }
> = {
  below: {
    icon: TrendingDown,
    color: "var(--market-below)",
    suggestion: "Votre prix est compétitif. Cela peut accélérer la vente.",
  },
  aligned: {
    icon: Minus,
    color: "var(--market-aligned)",
    suggestion: "Votre prix est en ligne avec le marché.",
  },
  above: {
    icon: TrendingUp,
    color: "var(--market-above)",
    suggestion:
      "Envisagez de baisser le prix pour accélérer la vente, ou mettez en avant les atouts de votre véhicule.",
  },
};

function formatPrice(price: number | null): string {
  if (price === null) return "-";
  return `${price.toLocaleString("fr-FR")} €`;
}

export function MarketPositionDetail({ listing, onClose }: MarketPositionDetailProps) {
  const { marketPosition, marketPercentageDiff, marketDisplayText, marketIsEstimation } = listing;

  if (!marketPosition || marketPosition === "unavailable") {
    return (
      <Card data-testid="market-position-detail">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Position marché</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} data-testid="market-detail-close">
            <X className="size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="size-4" />
            <span>Estimation non disponible pour cette annonce.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = POSITION_CONFIG[marketPosition] || POSITION_CONFIG.aligned;
  const Icon = config.icon;

  return (
    <Card data-testid="market-position-detail">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          Position marché — {listing.make} {listing.model} {listing.year}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="market-detail-close">
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Position indicator */}
        <div className="flex items-center gap-3" data-testid="market-position-badge">
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
            style={{
              color: config.color,
              backgroundColor: `color-mix(in srgb, ${config.color} 10%, transparent)`,
            }}
          >
            <Icon className="size-4" />
            <span>{marketDisplayText}</span>
          </div>
        </div>

        {/* Price comparison */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Votre prix</p>
            <p className="text-lg font-semibold">{formatPrice(listing.price)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Différence marché</p>
            <p className="text-lg font-semibold" style={{ color: config.color }}>
              {marketPercentageDiff !== null
                ? `${marketPercentageDiff > 0 ? "+" : ""}${marketPercentageDiff}%`
                : "-"}
            </p>
          </div>
        </div>

        {/* Suggestion */}
        <div className="rounded-lg bg-muted/50 p-3 text-sm" data-testid="market-suggestion">
          {config.suggestion}
        </div>

        {/* Estimation note */}
        {marketIsEstimation && (
          <div
            className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground"
            data-testid="market-estimation-note"
          >
            <Info className="size-4 flex-shrink-0 mt-0.5" />
            <span>
              Estimation basée sur des données internes. Intégration avec un fournisseur de données
              marché prévue.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
