"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Heart, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { IFavoriteEnriched, IConfigListingCard } from "@auto/shared";
import { getMyFavorites, markAllAsSeen } from "@/lib/api/favorites-api";
import { toggleFavorite } from "@/lib/api/favorites-api";
import { getCardConfig } from "@/lib/api/catalog-api";
import { ListingCard } from "@/components/listing/listing-card";
import { ChangeIndicator } from "@/components/favorites/change-indicator";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<IFavoriteEnriched[]>([]);
  const [cardConfig, setCardConfig] = useState<IConfigListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const [favData, config] = await Promise.all([getMyFavorites(), getCardConfig()]);
      setFavorites(favData.items);
      setCardConfig(config);

      // Check if any favorites have changes
      const anyChanges = favData.items.some(
        (f) =>
          f.changes.priceChanged || f.changes.photosAdded > 0 || f.changes.certificationChanged,
      );
      setHasChanges(anyChanges);
    } catch {
      toast.error("Erreur lors du chargement des favoris");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleUnfavorite = useCallback(async (listingId: string) => {
    try {
      await toggleFavorite(listingId);
      setFavorites((prev) => prev.filter((f) => f.listingId !== listingId));
      toast.success("Retirée des favoris");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }, []);

  const handleMarkAllAsSeen = useCallback(async () => {
    try {
      await markAllAsSeen();
      setHasChanges(false);
      await loadFavorites();
      toast.success("Tous les changements ont été marqués comme vus");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  }, [loadFavorites]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="favorites-loading">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 space-y-4"
        data-testid="favorites-empty"
      >
        <Heart className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Aucun favori pour le moment</p>
        <p className="text-sm text-muted-foreground">
          Parcourez les annonces et ajoutez vos véhicules préférés en favoris
        </p>
        <Button asChild>
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            Parcourir les annonces
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="favorites-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Mes favoris</h1>
          <p className="text-sm text-muted-foreground" data-testid="favorites-count">
            {favorites.length} favori{favorites.length > 1 ? "s" : ""}
          </p>
        </div>
        {hasChanges && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsSeen}
            data-testid="mark-all-seen"
          >
            <Eye className="mr-2 h-4 w-4" />
            Tout marquer comme vu
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="favorites-grid">
        {favorites.map((fav) => (
          <div
            key={fav.ID}
            className="relative space-y-2"
            data-testid={`favorite-item-${fav.listingId}`}
          >
            <ChangeIndicator changes={fav.changes} />
            <ListingCard
              listing={fav.listing}
              cardConfig={cardConfig}
              isFavorited={true}
              onFavoriteToggle={(favorited) => {
                if (!favorited) handleUnfavorite(fav.listingId);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
