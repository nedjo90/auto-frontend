"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IPublicListingCard, IConfigListingCard } from "@auto/shared";
import { LISTING_PAGE_SIZE } from "@auto/shared";
import { ListingCard } from "@/components/listing/listing-card";
import { ListingCardSkeletonGrid } from "@/components/listing/listing-card-skeleton";
import { Loader2 } from "lucide-react";

export interface ListingGridProps {
  initialItems: IPublicListingCard[];
  initialTotal: number;
  cardConfig: IConfigListingCard[];
  search?: string;
}

/**
 * Client component that handles infinite scroll for listing cards.
 * Initial items are SSR-rendered; subsequent pages load on scroll.
 */
export function ListingGrid({ initialItems, initialTotal, cardConfig, search }: ListingGridProps) {
  const [items, setItems] = useState<IPublicListingCard[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length < initialTotal);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef(initialItems.length);

  // Reset when search changes
  useEffect(() => {
    setItems(initialItems);
    setTotal(initialTotal);
    setHasMore(initialItems.length < initialTotal);
    skipRef.current = initialItems.length;
  }, [initialItems, initialTotal]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const res = await fetch(`${API_BASE}/api/catalog/getListings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skip: skipRef.current,
          top: LISTING_PAGE_SIZE,
          search: search || "",
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const newItems: IPublicListingCard[] =
        typeof data.items === "string" ? JSON.parse(data.items) : data.items || [];

      setItems((prev) => [...prev, ...newItems]);
      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);
      skipRef.current += newItems.length;
    } catch {
      // Silently fail, user can scroll again
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, search]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0 && !isLoading) {
    return (
      <div className="py-12 text-center" data-testid="listing-grid-empty">
        <p className="text-lg font-medium text-muted-foreground">Aucune annonce trouvée</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Essayez de modifier vos critères de recherche
        </p>
      </div>
    );
  }

  return (
    <div data-testid="listing-grid">
      {/* Result count */}
      <p className="mb-4 text-sm text-muted-foreground" data-testid="listing-grid-count">
        {total} annonce{total !== 1 ? "s" : ""} trouvée{total !== 1 ? "s" : ""}
      </p>

      {/* Listing cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing, index) => (
          <ListingCard
            key={listing.ID}
            listing={listing}
            cardConfig={cardConfig}
            priority={index < 3}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel + loading indicator */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex justify-center py-8"
          data-testid="listing-grid-sentinel"
        >
          {isLoading && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          )}
        </div>
      )}

      {/* Loading skeleton for bottom */}
      {isLoading && hasMore && <ListingCardSkeletonGrid count={3} />}
    </div>
  );
}
