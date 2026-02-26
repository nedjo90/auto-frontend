import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listing/listing-card";
import { ListingCardSkeleton } from "@/components/listing/listing-card-skeleton";
import { getListings, getCardConfig } from "@/lib/api/catalog-api";
import { ArrowRight } from "lucide-react";

/**
 * Featured listings section — server component that fetches recent active listings.
 */
export async function FeaturedListings() {
  let listings;
  let cardConfig;

  try {
    [listings, cardConfig] = await Promise.all([
      getListings({ top: 8, filters: { sort: "createdAt_desc" } }),
      getCardConfig(),
    ]);
  } catch {
    listings = { items: [], total: 0, skip: 0, top: 8, hasMore: false };
    cardConfig = [];
  }

  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14 lg:py-16" data-testid="featured-listings">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-lg font-bold sm:text-xl lg:text-2xl">Annonces recentes</h2>

        {listings.items.length > 0 ? (
          <>
            <div
              className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              data-testid="featured-listings-grid"
            >
              {listings.items.map((listing, i) => (
                <ListingCard
                  key={listing.ID}
                  listing={listing}
                  cardConfig={cardConfig}
                  priority={i < 2}
                />
              ))}
            </div>
            <div className="mt-6 text-center sm:mt-8">
              <Button variant="outline" asChild>
                <Link href="/search" data-testid="featured-view-all">
                  Voir toutes les annonces
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div
            className="mt-6 rounded-lg border border-dashed p-8 text-center sm:p-12"
            data-testid="featured-empty"
          >
            <p className="text-sm text-muted-foreground sm:text-base">
              Aucune annonce pour le moment
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Loading skeleton for FeaturedListings section.
 */
export function FeaturedListingsSkeleton() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
