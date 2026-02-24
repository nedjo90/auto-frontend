"use client";

import { useState } from "react";
import { CheckCircle, Archive, Eye, Heart, MessageCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ISellerPublishedListing } from "@auto/shared";
import { MarkSoldDialog } from "./mark-sold-dialog";
import { ArchiveDialog } from "./archive-dialog";

interface ListingActionCardProps {
  listing: ISellerPublishedListing;
  onMarkAsSold: (listingId: string) => Promise<void>;
  onArchive: (listingId: string) => Promise<void>;
}

export function ListingActionCard({ listing, onMarkAsSold, onArchive }: ListingActionCardProps) {
  const [showSoldDialog, setShowSoldDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

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

  return (
    <>
      <Card data-testid="listing-action-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: listing info */}
            <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Photo thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
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
                <h3 className="font-semibold text-sm sm:text-base truncate">{title}</h3>
                {priceFormatted && (
                  <p className="text-lg font-bold text-primary mt-0.5">{priceFormatted}</p>
                )}

                {/* Metrics row */}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {listing.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {listing.favoriteCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {listing.chatCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {listing.daysOnMarket}j
                  </span>
                </div>

                {/* Visibility score */}
                <Badge
                  variant={
                    listing.visibilityScore >= 80
                      ? "default"
                      : listing.visibilityScore >= 50
                        ? "secondary"
                        : "outline"
                  }
                  className="mt-2 text-xs"
                >
                  Score {listing.visibilityScore}%
                </Badge>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex gap-2 sm:flex-col sm:items-end flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-1 sm:flex-none min-h-11 sm:min-h-9"
                onClick={() => setShowSoldDialog(true)}
                data-testid="mark-sold-button"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Marquer comme</span> vendu
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground flex-1 sm:flex-none min-h-11 sm:min-h-9"
                onClick={() => setShowArchiveDialog(true)}
                data-testid="archive-button"
              >
                <Archive className="h-4 w-4 mr-1.5" />
                Retirer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <MarkSoldDialog
        open={showSoldDialog}
        onOpenChange={setShowSoldDialog}
        listingTitle={title}
        onConfirm={() => onMarkAsSold(listing.ID)}
      />

      <ArchiveDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        listingTitle={title}
        onConfirm={() => onArchive(listing.ID)}
      />
    </>
  );
}
