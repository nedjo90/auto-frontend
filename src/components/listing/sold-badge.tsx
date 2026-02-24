"use client";

import { Badge } from "@/components/ui/badge";

interface SoldBadgeProps {
  className?: string;
}

export function SoldBadge({ className }: SoldBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`bg-blue-100 text-blue-800 border-blue-200 text-sm sm:text-base px-3 py-1 font-semibold ${className || ""}`}
      data-testid="sold-badge"
    >
      Vendu
    </Badge>
  );
}
