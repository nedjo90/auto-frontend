"use client";

import { Eye, Heart, MessageCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ISellerListingHistoryItem } from "@auto/shared";

interface ListingHistoryCardProps {
  listing: ISellerListingHistoryItem;
}

const STATUS_BADGE_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  published: { label: "En ligne", variant: "default" },
  sold: { label: "Vendu", variant: "secondary" },
  archived: { label: "Archive", variant: "outline" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ListingHistoryCard({ listing }: ListingHistoryCardProps) {
  const title =
    listing.make && listing.model
      ? `${listing.make} ${listing.model}${listing.year ? ` (${listing.year})` : ""}`
      : "Vehicule";

  const priceFormatted = listing.price
    ? new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(listing.price)
    : null;

  const badgeConfig = STATUS_BADGE_CONFIG[listing.status] || {
    label: listing.status,
    variant: "outline" as const,
  };

  return (
    <Card data-testid="listing-history-card">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: listing info */}
          <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Photo thumbnail */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
              {listing.primaryPhotoUrl ? (
                <img
                  src={listing.primaryPhotoUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  Pas de photo
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base truncate">{title}</h3>
                <Badge variant={badgeConfig.variant} className="text-xs flex-shrink-0">
                  {badgeConfig.label}
                </Badge>
              </div>

              {priceFormatted && (
                <p className="text-sm font-medium text-muted-foreground mt-0.5">{priceFormatted}</p>
              )}

              {/* Dates */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span>Publie : {formatDate(listing.publishedAt)}</span>
                {listing.soldAt && <span>Vendu : {formatDate(listing.soldAt)}</span>}
                {listing.archivedAt && <span>Archive : {formatDate(listing.archivedAt)}</span>}
              </div>
            </div>
          </div>

          {/* Right: metrics */}
          <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {listing.viewCount} vues
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {listing.favoriteCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {listing.chatCount}
            </span>
            {listing.daysOnMarket !== null && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {listing.daysOnMarket}j
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
