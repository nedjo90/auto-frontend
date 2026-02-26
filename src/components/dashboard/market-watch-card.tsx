"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Trash2, Clock, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceChangeBadge } from "@/components/dashboard/price-change-badge";
import { formatPrice, buildImageUrl } from "@/lib/api/catalog-api";
import type { IMarketWatchEnriched } from "@auto/shared";

interface MarketWatchCardProps {
  watch: IMarketWatchEnriched;
  onRemove: (listingId: string) => void;
}

function daysOnline(publishedAt: string | null): number | null {
  if (!publishedAt) return null;
  return Math.floor((Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Card for a market-watched listing showing price, change history,
 * days online, and an unwatch action.
 */
export function MarketWatchCard({ watch, onRemove }: MarketWatchCardProps) {
  const { listing, priceHistory, hasChangedSinceLastVisit, notes } = watch;

  const title =
    [listing.make, listing.model, listing.year ? `(${listing.year})` : ""]
      .filter(Boolean)
      .join(" ") || "Annonce";

  const imageUrl = buildImageUrl(listing.primaryPhotoUrl, { width: 400 });
  const days = daysOnline(listing.publishedAt);

  return (
    <Card
      className={`overflow-hidden transition-shadow hover:shadow-md ${hasChangedSinceLastVisit ? "ring-2 ring-blue-400" : ""}`}
      data-testid={`market-watch-card-${listing.ID}`}
    >
      <div className="relative aspect-[4/3] bg-muted">
        <Link href={`/listing/${listing.slug || listing.ID}`}>
          {listing.primaryPhotoUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-sm">Pas de photo</span>
            </div>
          )}
        </Link>
        {/* Change indicator */}
        {hasChangedSinceLastVisit && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-blue-600 text-white" data-testid="change-badge">
              <Eye className="mr-1 h-3 w-3" />
              Modifié
            </Badge>
          </div>
        )}
        {/* Remove button */}
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(watch.listingId);
            }}
            aria-label="Retirer du suivi"
            data-testid="remove-watch-button"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90"
          >
            <Trash2 className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 space-y-2">
        {/* Price + change badge */}
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-lg font-bold text-primary sm:text-xl" data-testid="watch-price">
            {formatPrice(listing.price) || "Prix non renseigné"}
          </p>
          <PriceChangeBadge priceHistory={priceHistory} />
        </div>

        {/* Title */}
        <h3 className="truncate text-sm font-semibold sm:text-base" data-testid="watch-title">
          <Link href={`/listing/${listing.slug || listing.ID}`} className="hover:underline">
            {title}
          </Link>
        </h3>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5">
          {days != null && (
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {days}j en ligne
            </Badge>
          )}
          {listing.certificationLevel && (
            <Badge variant="secondary" className="text-xs">
              {listing.certificationLevel}
            </Badge>
          )}
          {listing.fuelType && (
            <Badge variant="outline" className="text-xs">
              {listing.fuelType}
            </Badge>
          )}
        </div>

        {/* Notes */}
        {notes && (
          <p
            className="text-xs text-muted-foreground flex items-start gap-1"
            data-testid="watch-notes"
          >
            <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />
            {notes}
          </p>
        )}

        {/* Price history timeline */}
        {priceHistory.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Historique des prix ({priceHistory.length})
            </p>
            <div className="space-y-1" data-testid="price-history">
              {priceHistory.slice(0, 3).map((ph) => (
                <div key={ph.ID} className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {ph.previousPrice != null
                      ? `${formatPrice(ph.previousPrice)} → ${formatPrice(ph.price)}`
                      : formatPrice(ph.price)}
                  </span>
                  <span>{new Date(ph.changedAt).toLocaleDateString("fr-FR")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
