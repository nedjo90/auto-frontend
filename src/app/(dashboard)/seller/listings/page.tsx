"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ISellerPublishedListing } from "@auto/shared";
import { getSellerListings, markAsSold, archiveListing } from "@/lib/api/lifecycle-api";
import { ListingActionCard } from "@/components/listing/listing-action-card";

export default function SellerListingsPage() {
  const [listings, setListings] = useState<ISellerPublishedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadListings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSellerListings();
      setListings(data);
    } catch {
      toast.error("Erreur lors du chargement des annonces");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleMarkAsSold = async (listingId: string) => {
    try {
      await markAsSold(listingId);
      toast.success("Annonce marquee comme vendue");
      setListings((prev) => prev.filter((l) => l.ID !== listingId));
    } catch {
      toast.error("Erreur lors du marquage comme vendu");
    }
  };

  const handleArchive = async (listingId: string) => {
    try {
      await archiveListing(listingId);
      toast.success("Annonce retiree");
      setListings((prev) => prev.filter((l) => l.ID !== listingId));
    } catch {
      toast.error("Erreur lors du retrait de l'annonce");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Mes annonces en ligne</h1>
          <p className="text-sm text-muted-foreground mt-1 sm:mt-2 sm:text-base">
            Gerez vos annonces publiees.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Mes annonces en ligne</h1>
        <p className="text-sm text-muted-foreground mt-1 sm:mt-2 sm:text-base">
          {listings.length > 0
            ? `${listings.length} annonce${listings.length > 1 ? "s" : ""} en ligne`
            : "Aucune annonce en ligne"}
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-state">
          <p className="text-muted-foreground">
            Vous n&apos;avez aucune annonce publiee pour le moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4" data-testid="listings-grid">
          {listings.map((listing) => (
            <ListingActionCard
              key={listing.ID}
              listing={listing}
              onMarkAsSold={handleMarkAsSold}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
