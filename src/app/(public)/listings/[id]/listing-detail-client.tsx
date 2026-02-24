"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoldBadge } from "@/components/listing/sold-badge";
import { getPublicListing } from "@/lib/api/lifecycle-api";

interface ListingDetailClientProps {
  listingId: string;
}

export function ListingDetailClient({ listingId }: ListingDetailClientProps) {
  const [listing, setListing] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPublicListing(listingId);
        if (!data) {
          setError("Annonce introuvable");
        } else {
          setListing(data);
        }
      } catch {
        setError("Erreur lors du chargement de l'annonce");
      } finally {
        setIsLoading(false);
      }
    }
    loadListing();
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error || "Annonce introuvable"}</p>
      </div>
    );
  }

  const isSold = listing.status === "sold";
  const title =
    [listing.make, listing.model, listing.year ? `(${listing.year})` : ""]
      .filter(Boolean)
      .join(" ") || "Annonce";

  const priceFormatted =
    typeof listing.price === "number"
      ? new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(listing.price)
      : null;

  return (
    <div className="space-y-6">
      {/* Header with sold badge */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">{title}</h1>
          {priceFormatted && (
            <p className="text-2xl font-bold text-primary mt-1 sm:text-3xl">{priceFormatted}</p>
          )}
        </div>

        {isSold && (
          <div className="flex-shrink-0">
            <SoldBadge className="text-lg px-4 py-2" />
          </div>
        )}
      </div>

      {/* Sold banner */}
      {isSold && (
        <div
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm sm:text-base"
          data-testid="sold-banner"
        >
          Ce vehicule a ete vendu. L&apos;annonce est conservee a titre informatif.
        </div>
      )}

      {/* Listing content placeholder */}
      <div className="space-y-4">
        {listing.description && (
          <div>
            <h2 className="font-semibold text-base sm:text-lg mb-2">Description</h2>
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line">
              {listing.description as string}
            </p>
          </div>
        )}
      </div>

      {/* Contact button (disabled when sold) */}
      <div className="sticky bottom-0 bg-background border-t p-4 -mx-4 sm:static sm:border-0 sm:p-0 sm:mx-0">
        {isSold ? (
          <div className="space-y-3">
            <Button
              disabled
              className="w-full min-h-11 sm:w-auto"
              data-testid="contact-button-disabled"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contacter le vendeur
            </Button>
            <p className="text-xs text-muted-foreground">
              Ce vehicule a ete vendu, il n&apos;est plus possible de contacter le vendeur.
            </p>
          </div>
        ) : (
          <Button className="w-full min-h-11 sm:w-auto" data-testid="contact-button">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contacter le vendeur
          </Button>
        )}
      </div>
    </div>
  );
}
