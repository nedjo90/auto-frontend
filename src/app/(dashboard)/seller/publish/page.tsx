"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Camera, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import type { IPublishableListing } from "@auto/shared";
import { getPublishableListings, createCheckoutSession } from "@/lib/api/publish-api";

function formatEuroCents(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default function PublishPage() {
  const router = useRouter();
  const [listings, setListings] = useState<IPublishableListing[]>([]);
  const [unitPriceCents, setUnitPriceCents] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPublishableListings();
      setListings(data.listings);
      setUnitPriceCents(data.unitPriceCents);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du chargement des annonces");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === listings.length) {
        return new Set();
      }
      return new Set(listings.map((l) => l.ID));
    });
  }, [listings]);

  const totalCents = useMemo(
    () => selectedIds.size * unitPriceCents,
    [selectedIds.size, unitPriceCents],
  );

  const allSelected = listings.length > 0 && selectedIds.size === listings.length;

  const handleCheckout = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsCheckingOut(true);
    try {
      const ids = Array.from(selectedIds);
      const successUrl = `${window.location.origin}/seller/publish/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/seller/publish`;

      const result = await createCheckoutSession(ids, successUrl, cancelUrl);

      // Redirect to Stripe Checkout
      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création du paiement");
      setIsCheckingOut(false);
    }
  }, [selectedIds]);

  if (isLoading) {
    return (
      <div data-testid="publish-skeleton">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="publish-page">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/seller/drafts")}
            data-testid="back-to-drafts-btn"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-bold">Publier mes annonces</h1>
        </div>
      </div>

      {listings.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-testid="publish-empty-state"
        >
          <p className="text-lg text-muted-foreground mb-4">
            Aucune annonce éligible à la publication. Complétez un brouillon avec la déclaration sur
            l&apos;honneur pour pouvoir publier.
          </p>
          <Button onClick={() => router.push("/seller/drafts")} data-testid="empty-go-drafts-btn">
            Retour aux brouillons
          </Button>
        </div>
      ) : (
        <>
          {/* Select all */}
          <div className="flex items-center gap-3 mb-4" data-testid="select-all-row">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              data-testid="select-all-checkbox"
              aria-label="Tout sélectionner"
            />
            <span className="text-sm font-medium">
              Tout sélectionner ({listings.length} annonce{listings.length > 1 ? "s" : ""})
            </span>
          </div>

          {/* Listings grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6" data-testid="publish-grid">
            {listings.map((listing) => {
              const title =
                listing.make && listing.model ? `${listing.make} ${listing.model}` : "Véhicule";
              const isSelected = selectedIds.has(listing.ID);

              return (
                <Card
                  key={listing.ID}
                  className={`cursor-pointer transition-colors ${isSelected ? "ring-2 ring-primary" : ""}`}
                  onClick={() => toggleSelection(listing.ID)}
                  data-testid={`publish-card-${listing.ID}`}
                >
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(listing.ID)}
                      data-testid={`publish-checkbox-${listing.ID}`}
                      aria-label={`Sélectionner ${title}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <CardTitle className="text-base" data-testid="publish-card-title">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {listing.year && (
                      <p className="text-sm text-muted-foreground">Année : {listing.year}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={listing.visibilityScore >= 70 ? "default" : "secondary"}
                        data-testid="publish-card-score"
                      >
                        Score : {listing.visibilityScore}%
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Camera className="size-4" />
                        <span data-testid="publish-card-photos">{listing.photoCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sticky bottom bar with total and checkout */}
          <div
            className="sticky bottom-0 bg-background border-t p-4 -mx-4 flex items-center justify-between"
            data-testid="checkout-bar"
          >
            <div data-testid="checkout-summary">
              <p className="text-sm text-muted-foreground">
                {selectedIds.size} annonce{selectedIds.size !== 1 ? "s" : ""} sélectionnée
                {selectedIds.size !== 1 ? "s" : ""}
              </p>
              <p className="text-lg font-bold" data-testid="checkout-total">
                {formatEuroCents(totalCents)}
              </p>
              {selectedIds.size > 0 && unitPriceCents > 0 && (
                <p className="text-xs text-muted-foreground" data-testid="checkout-unit-price">
                  {formatEuroCents(unitPriceCents)} par annonce
                </p>
              )}
            </div>
            <Button
              size="lg"
              disabled={selectedIds.size === 0 || isCheckingOut}
              onClick={handleCheckout}
              data-testid="checkout-btn"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 size-4" />
                  Payer {selectedIds.size > 0 ? formatEuroCents(totalCents) : ""}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
