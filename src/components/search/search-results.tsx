"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  IPublicListingCard,
  IConfigListingCard,
  ISearchFilters,
  SearchSortOption,
} from "@auto/shared";
import { LISTING_PAGE_SIZE, SEARCH_SORT_OPTIONS, SEARCH_DEBOUNCE_MS } from "@auto/shared";
import { ListingCard } from "@/components/listing/listing-card";
import { ListingCardSkeletonGrid } from "@/components/listing/listing-card-skeleton";
import { SearchFilters } from "@/components/search/search-filters";
import { FilterChips } from "@/components/search/filter-chips";
import { parseSearchParams, serializeSearchParams } from "@/lib/search-params";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export interface SearchResultsProps {
  initialItems: IPublicListingCard[];
  initialTotal: number;
  cardConfig: IConfigListingCard[];
  initialFilters: ISearchFilters;
}

/**
 * Client component: search results with filters, sorting, chips, infinite scroll.
 * URL query parameters are the single source of truth for filter state.
 */
export function SearchResults({
  initialItems,
  initialTotal,
  cardConfig,
  initialFilters,
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ISearchFilters>(initialFilters);
  const [items, setItems] = useState<IPublicListingCard[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length < initialTotal);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef(initialItems.length);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync filters from URL on navigation
  useEffect(() => {
    const parsed = parseSearchParams(searchParams);
    setFilters(parsed);
  }, [searchParams]);

  // Reset items when initialItems change (SSR re-render)
  useEffect(() => {
    setItems(initialItems);
    setTotal(initialTotal);
    setHasMore(initialItems.length < initialTotal);
    skipRef.current = initialItems.length;
  }, [initialItems, initialTotal]);

  /** Push filters to URL (debounced). */
  const pushFilters = useCallback(
    (newFilters: ISearchFilters) => {
      setFilters(newFilters);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const qs = serializeSearchParams(newFilters);
        router.push(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
      }, SEARCH_DEBOUNCE_MS);
    },
    [router],
  );

  /** Handle sort change (immediate, no debounce). */
  const handleSortChange = useCallback(
    (value: string) => {
      const newFilters = { ...filters, sort: value as SearchSortOption };
      setFilters(newFilters);
      const qs = serializeSearchParams(newFilters);
      router.push(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [filters, router],
  );

  /** Load more items (infinite scroll). */
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const body: Record<string, unknown> = {
        skip: skipRef.current,
        top: LISTING_PAGE_SIZE,
      };
      if (filters.search) body.search = filters.search;
      if (filters.minPrice != null) body.minPrice = filters.minPrice;
      if (filters.maxPrice != null) body.maxPrice = filters.maxPrice;
      if (filters.make) body.make = filters.make;
      if (filters.model) body.model = filters.model;
      if (filters.minYear != null) body.minYear = filters.minYear;
      if (filters.maxYear != null) body.maxYear = filters.maxYear;
      if (filters.maxMileage != null) body.maxMileage = filters.maxMileage;
      if (filters.fuelType?.length) body.fuelType = JSON.stringify(filters.fuelType);
      if (filters.gearbox?.length) body.gearbox = JSON.stringify(filters.gearbox);
      if (filters.bodyType?.length) body.bodyType = JSON.stringify(filters.bodyType);
      if (filters.color?.length) body.color = JSON.stringify(filters.color);
      if (filters.sort && filters.sort !== "relevance") body.sort = filters.sort;

      const res = await fetch(`${API_BASE}/api/catalog/getListings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, filters]);

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

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6" data-testid="search-results">
      {/* Filter sidebar / mobile drawer */}
      <SearchFilters filters={filters} onFiltersChange={pushFilters} />

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Filter chips */}
        <FilterChips filters={filters} onFiltersChange={pushFilters} />

        {/* Results header: count + sort */}
        <div className="mt-3 flex items-center justify-between gap-2 mb-4">
          <p className="text-sm text-muted-foreground" data-testid="search-result-count">
            {total} annonce{total !== 1 ? "s" : ""} trouvée{total !== 1 ? "s" : ""}
          </p>
          <Select value={filters.sort || "relevance"} onValueChange={handleSortChange}>
            <SelectTrigger className="h-8 w-auto min-w-[140px] text-sm" data-testid="search-sort">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.labelFr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results grid */}
        {items.length === 0 && !isLoading ? (
          <div className="py-12 text-center" data-testid="search-empty">
            <p className="text-lg font-medium text-muted-foreground">Aucune annonce trouvée</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <>
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

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div
                ref={sentinelRef}
                className="flex justify-center py-8"
                data-testid="search-sentinel"
              >
                {isLoading && (
                  <Loader2
                    className="h-6 w-6 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>
            )}

            {isLoading && hasMore && <ListingCardSkeletonGrid count={3} />}
          </>
        )}
      </div>
    </div>
  );
}
