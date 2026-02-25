"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SoldBadge } from "@/components/listing/sold-badge";
import { PublicPhotoGallery } from "@/components/listing/public-photo-gallery";
import { MarketPriceIndicator } from "@/components/listing/market-price-indicator";
import type { IPublicListingDetail } from "@auto/shared";
import { formatPrice, formatMileage } from "@/lib/api/catalog-api";

interface ListingDetailClientProps {
  listingId: string;
}

/** Field display configuration for the detail page. */
const SPEC_FIELDS: { key: keyof IPublicListingDetail; label: string }[] = [
  { key: "year", label: "Année" },
  { key: "mileage", label: "Kilométrage" },
  { key: "fuelType", label: "Carburant" },
  { key: "gearbox", label: "Boîte de vitesses" },
  { key: "bodyType", label: "Carrosserie" },
  { key: "color", label: "Couleur" },
  { key: "doors", label: "Portes" },
  { key: "seats", label: "Places" },
  { key: "engineCapacityCc", label: "Cylindrée" },
  { key: "powerHp", label: "Puissance" },
  { key: "co2GKm", label: "CO₂" },
  { key: "euroNorm", label: "Norme Euro" },
  { key: "energyClass", label: "Classe énergie" },
  { key: "critAirLabel", label: "Crit'Air" },
  { key: "transmission", label: "Transmission" },
  { key: "driveType", label: "Traction" },
  { key: "condition", label: "État" },
  { key: "interiorColor", label: "Intérieur" },
  { key: "exteriorColor", label: "Extérieur" },
];

function formatFieldValue(key: string, value: unknown): string | null {
  if (value == null || value === "") return null;
  switch (key) {
    case "mileage":
      return formatMileage(value as number);
    case "engineCapacityCc":
      return `${value} cc`;
    case "powerHp":
      return `${value} ch`;
    case "co2GKm":
      return `${value} g/km`;
    default:
      return String(value);
  }
}

/** Get certification color. */
function getCertBadgeClass(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (score >= 50) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
}

export function ListingDetailClient({ listingId }: ListingDetailClientProps) {
  const [listing, setListing] = useState<IPublicListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      try {
        setIsLoading(true);
        setError(null);
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const res = await fetch(`${API_BASE}/api/catalog/getListingDetail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError("Annonce introuvable");
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const parsed = typeof data.listing === "string" ? JSON.parse(data.listing) : data.listing;
        setListing(parsed);
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
      <div className="flex items-center justify-center py-12" data-testid="listing-detail-loading">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center py-12" data-testid="listing-detail-error">
        <p className="text-muted-foreground">{error || "Annonce introuvable"}</p>
      </div>
    );
  }

  const isSold = listing.status === "sold";
  const title =
    [listing.make, listing.model, listing.variant, listing.year ? `(${listing.year})` : ""]
      .filter(Boolean)
      .join(" ") || "Annonce";

  const priceFormatted = formatPrice(listing.price);

  // Count certified fields
  const certifiedCount = listing.certifiedFields.filter((cf) => cf.isCertified).length;

  return (
    <div className="space-y-6" data-testid="listing-detail">
      {/* Sold banner */}
      {isSold && (
        <div
          className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 sm:text-base"
          data-testid="sold-banner"
        >
          Ce véhicule a été vendu. L&apos;annonce est conservée à titre informatif.
        </div>
      )}

      {/* Desktop: 60/40 split, Mobile: stacked */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Gallery (60% desktop) */}
        <div className="w-full lg:w-[60%]">
          <PublicPhotoGallery photos={listing.photos} title={title} />
        </div>

        {/* Right: Info (40% desktop) */}
        <div className="w-full space-y-4 lg:w-[40%]">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1
                className="text-xl font-bold sm:text-2xl lg:text-3xl"
                data-testid="listing-detail-title"
              >
                {title}
              </h1>
              {priceFormatted && (
                <div className="mt-1">
                  <p
                    className="text-2xl font-bold text-primary sm:text-3xl"
                    data-testid="listing-detail-price"
                  >
                    {priceFormatted}
                  </p>
                  <MarketPriceIndicator comparison={listing.marketComparison} />
                </div>
              )}
            </div>
            {isSold && (
              <div className="flex-shrink-0">
                <SoldBadge className="text-lg px-4 py-2" />
              </div>
            )}
          </div>

          {/* Certification level */}
          <div className="flex flex-wrap gap-2">
            <Badge
              className={getCertBadgeClass(listing.visibilityScore)}
              data-testid="listing-detail-cert-badge"
            >
              <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              {listing.visibilityLabel}
            </Badge>
            {certifiedCount > 0 && (
              <Badge variant="outline" data-testid="listing-detail-cert-count">
                {certifiedCount} champ{certifiedCount > 1 ? "s" : ""} certifié
                {certifiedCount > 1 ? "s" : ""}
              </Badge>
            )}
            {listing.hasHistoryReport && (
              <Badge variant="outline" className="text-green-700 dark:text-green-400">
                <FileText className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Historique disponible
              </Badge>
            )}
          </div>

          {/* Key specs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium sm:text-base">Caractéristiques</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2">
              {SPEC_FIELDS.map(({ key, label }) => {
                const value = formatFieldValue(key, listing[key]);
                if (!value) return null;

                const isCertified = listing.certifiedFields.some(
                  (cf) => cf.fieldName === key && cf.isCertified,
                );

                return (
                  <div key={key} className="text-sm" data-testid={`spec-field-${key}`}>
                    <span className="text-muted-foreground">{label}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{value}</span>
                      {isCertified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-green-600" aria-label="Certifié" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Description */}
          {listing.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium sm:text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className="whitespace-pre-line text-sm text-muted-foreground sm:text-base"
                  data-testid="listing-detail-description"
                >
                  {listing.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sticky contact bar */}
      <div
        className="sticky bottom-0 -mx-4 border-t bg-background p-4 sm:static sm:mx-0 sm:border-0 sm:p-0"
        data-testid="contact-bar"
      >
        {isSold ? (
          <div className="space-y-2">
            <Button
              disabled
              className="w-full min-h-11 sm:w-auto"
              data-testid="contact-button-disabled"
            >
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Contacter le vendeur
            </Button>
            <p className="text-xs text-muted-foreground">
              Ce véhicule a été vendu, il n&apos;est plus possible de contacter le vendeur.
            </p>
          </div>
        ) : (
          <Button className="w-full min-h-11 sm:w-auto" data-testid="contact-button">
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Contacter le vendeur
          </Button>
        )}
      </div>
    </div>
  );
}
