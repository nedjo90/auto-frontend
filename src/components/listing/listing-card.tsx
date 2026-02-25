import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { IPublicListingCard, IConfigListingCard } from "@auto/shared";
import { formatPrice, formatMileage, buildImageUrl } from "@/lib/api/catalog-api";
import { MarketPriceIndicator } from "@/components/listing/market-price-indicator";
import { FavoriteButton } from "@/components/listing/favorite-button";

export interface ListingCardProps {
  listing: IPublicListingCard;
  cardConfig: IConfigListingCard[];
  priority?: boolean;
  isFavorited?: boolean;
  onFavoriteToggle?: (favorited: boolean) => void;
}

/** Map field names to their display values. */
function getFieldValue(listing: IPublicListingCard, fieldName: string): string | null {
  switch (fieldName) {
    case "price":
      return formatPrice(listing.price);
    case "make":
      return listing.make;
    case "model":
      return listing.model;
    case "variant":
      return listing.variant;
    case "year":
      return listing.year != null ? String(listing.year) : null;
    case "mileage":
      return formatMileage(listing.mileage);
    case "fuelType":
      return listing.fuelType;
    case "gearbox":
      return listing.gearbox;
    case "bodyType":
      return listing.bodyType;
    case "color":
      return listing.color;
    case "condition":
      return listing.condition;
    case "visibilityLabel":
      return listing.visibilityLabel;
    default:
      return null;
  }
}

/** Get certification level color based on score. */
function getCertificationColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (score >= 50) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
}

/**
 * Public listing card for marketplace browsing.
 * Supports 4-7 configurable fields via ConfigListingCard.
 */
export function ListingCard({
  listing,
  cardConfig,
  priority = false,
  isFavorited,
  onFavoriteToggle,
}: ListingCardProps) {
  const title =
    [listing.make, listing.model, listing.year ? `(${listing.year})` : ""]
      .filter(Boolean)
      .join(" ") || "Annonce";

  const priceDisplay = formatPrice(listing.price);
  const imageUrl = buildImageUrl(listing.primaryPhotoUrl, { width: 400 });

  // Filter visible fields from config, excluding price (shown separately)
  const displayFields = cardConfig
    .filter((c) => c.isVisible && c.fieldName !== "price")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <Link
      href={`/listings/${listing.ID}`}
      className="block"
      data-testid={`listing-card-${listing.ID}`}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        {/* Hero image */}
        <div className="relative aspect-[4/3] bg-muted">
          {listing.primaryPhotoUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-sm">Pas de photo</span>
            </div>
          )}
          {/* Favorite button overlay */}
          {isFavorited !== undefined && (
            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton
                listingId={listing.ID}
                isFavorited={isFavorited}
                size="sm"
                onToggle={onFavoriteToggle}
              />
            </div>
          )}
          {/* Photo count overlay */}
          {listing.photoCount > 1 && (
            <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
              {listing.photoCount} photos
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4">
          {/* Price + Market indicator */}
          {priceDisplay && (
            <div className="flex items-baseline gap-2">
              <p
                className="text-lg font-bold text-primary sm:text-xl"
                data-testid="listing-card-price"
              >
                {priceDisplay}
              </p>
              <MarketPriceIndicator comparison={listing.marketComparison} compact />
            </div>
          )}

          {/* Title */}
          <h3
            className="mt-1 truncate text-sm font-semibold sm:text-base"
            data-testid="listing-card-title"
          >
            {title}
          </h3>

          {/* Configurable fields */}
          <div className="mt-2 flex flex-wrap gap-1.5" data-testid="listing-card-fields">
            {displayFields.map((config) => {
              const value = getFieldValue(listing, config.fieldName);
              if (!value) return null;

              if (config.fieldType === "badge") {
                const isCertification = config.fieldName === "visibilityLabel";
                return (
                  <Badge
                    key={config.fieldName}
                    variant="secondary"
                    className={
                      isCertification
                        ? getCertificationColor(listing.visibilityScore)
                        : "bg-muted text-muted-foreground"
                    }
                    data-testid={`listing-card-field-${config.fieldName}`}
                  >
                    {value}
                  </Badge>
                );
              }

              return (
                <span
                  key={config.fieldName}
                  className="text-xs text-muted-foreground sm:text-sm"
                  data-testid={`listing-card-field-${config.fieldName}`}
                >
                  {value}
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
