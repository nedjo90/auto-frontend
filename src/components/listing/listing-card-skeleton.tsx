import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder for a listing card during loading.
 * Matches the layout of ListingCard to prevent CLS.
 */
export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden" data-testid="listing-card-skeleton">
      {/* Hero image skeleton */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      <CardContent className="p-3 sm:p-4">
        {/* Price */}
        <Skeleton className="h-6 w-24 sm:h-7" />

        {/* Title */}
        <Skeleton className="mt-1 h-4 w-3/4 sm:h-5" />

        {/* Fields */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}

/** Grid of skeleton cards for loading state. */
export function ListingCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="listing-skeleton-grid"
    >
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
