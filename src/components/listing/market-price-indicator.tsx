import type { MarketComparison } from "@auto/shared";
import { TrendingDown, TrendingUp, Minus, Info } from "lucide-react";

export interface MarketPriceIndicatorProps {
  comparison: MarketComparison | null;
  compact?: boolean;
}

/**
 * Market price indicator showing the listing's position relative to market value.
 * Uses design token colors: --market-below (green), --market-aligned (gray), --market-above (orange).
 */
export function MarketPriceIndicator({ comparison, compact }: MarketPriceIndicatorProps) {
  if (!comparison) return null;

  const config = getIndicatorConfig(comparison.position);

  return (
    <div
      className={`inline-flex items-center gap-1 ${compact ? "text-xs" : "text-sm"}`}
      style={{ color: config.color }}
      data-testid={`market-indicator-${comparison.position}`}
    >
      <config.icon className={compact ? "size-3" : "size-4"} />
      <span className="font-medium">{comparison.displayText}</span>
    </div>
  );
}

function getIndicatorConfig(position: string) {
  switch (position) {
    case "below":
      return {
        icon: TrendingDown,
        color: "var(--market-below)",
      };
    case "above":
      return {
        icon: TrendingUp,
        color: "var(--market-above)",
      };
    case "aligned":
      return {
        icon: Minus,
        color: "var(--market-aligned)",
      };
    default:
      return {
        icon: Info,
        color: "var(--muted-foreground)",
      };
  }
}
