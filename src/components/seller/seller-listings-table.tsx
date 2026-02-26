"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Eye, MessageSquare, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ISellerListingPerformance } from "@auto/shared";
import type { SellerListingSortColumn } from "@auto/shared";

export interface SellerListingsTableProps {
  listings: ISellerListingPerformance[];
  loading: boolean;
  onSort?: (column: SellerListingSortColumn, dir: "asc" | "desc") => void;
  onListingClick?: (listingId: string) => void;
}

interface SortState {
  column: SellerListingSortColumn;
  dir: "asc" | "desc";
}

const MARKET_POSITION_COLORS: Record<string, string> = {
  below: "text-green-600 bg-green-50",
  aligned: "text-blue-600 bg-blue-50",
  above: "text-orange-600 bg-orange-50",
};

const MARKET_POSITION_LABELS: Record<string, string> = {
  below: "Bon prix",
  aligned: "Prix marché",
  above: "Au-dessus",
};

function formatPrice(price: number | null): string {
  if (price === null) return "-";
  return `${price.toLocaleString("fr-FR")} €`;
}

export function SellerListingsTable({
  listings,
  loading,
  onSort,
  onListingClick,
}: SellerListingsTableProps) {
  const [sort, setSort] = useState<SortState>({ column: "viewCount", dir: "desc" });

  const handleSort = (column: SellerListingSortColumn) => {
    const newDir = sort.column === column && sort.dir === "desc" ? "asc" : "desc";
    setSort({ column, dir: newDir });
    onSort?.(column, newDir);
  };

  if (loading) {
    return (
      <Card data-testid="listings-table-skeleton">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (listings.length === 0) {
    return (
      <Card data-testid="listings-table-empty">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Performances des annonces</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune annonce publiée. Publiez votre première annonce pour voir ses performances.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="seller-listings-table">
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Performances des annonces ({listings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pl-4 font-medium">Annonce</th>
                <SortHeader column="price" label="Prix" sort={sort} onSort={handleSort} />
                <SortHeader column="viewCount" label="Vues" sort={sort} onSort={handleSort} />
                <SortHeader column="chatCount" label="Contacts" sort={sort} onSort={handleSort} />
                <SortHeader column="daysOnMarket" label="Jours" sort={sort} onSort={handleSort} />
                <SortHeader
                  column="visibilityScore"
                  label="Score"
                  sort={sort}
                  onSort={handleSort}
                />
                <th className="pb-2 pr-4 font-medium">Marché</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr
                  key={listing.ID}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/50 transition-colors",
                    onListingClick && "cursor-pointer",
                  )}
                  onClick={() => onListingClick?.(listing.ID)}
                  onKeyDown={(e) => {
                    if (onListingClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onListingClick(listing.ID);
                    }
                  }}
                  tabIndex={onListingClick ? 0 : undefined}
                  role={onListingClick ? "button" : undefined}
                  data-testid={`listing-row-${listing.ID}`}
                >
                  <td className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      {listing.primaryPhotoUrl ? (
                        <Image
                          src={listing.primaryPhotoUrl}
                          alt={`${listing.make} ${listing.model}`}
                          width={48}
                          height={36}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="h-9 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          -
                        </div>
                      )}
                      <div>
                        <p className="font-medium truncate max-w-[180px]">
                          {listing.make} {listing.model}
                        </p>
                        <p className="text-xs text-muted-foreground">{listing.year || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-medium">{formatPrice(listing.price)}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3 text-muted-foreground" />
                      {listing.viewCount}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="size-3 text-muted-foreground" />
                      {listing.chatCount}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground" />
                      {listing.daysOnMarket ?? "-"}j
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3 text-muted-foreground" />
                      {listing.visibilityScore}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {listing.marketPosition ? (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          MARKET_POSITION_COLORS[listing.marketPosition] || "",
                        )}
                      >
                        {MARKET_POSITION_LABELS[listing.marketPosition] || listing.marketPosition}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y">
          {listings.map((listing) => (
            <div
              key={listing.ID}
              className={cn("p-4 space-y-2", onListingClick && "cursor-pointer active:bg-muted/50")}
              onClick={() => onListingClick?.(listing.ID)}
              onKeyDown={(e) => {
                if (onListingClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onListingClick(listing.ID);
                }
              }}
              tabIndex={onListingClick ? 0 : undefined}
              role={onListingClick ? "button" : undefined}
              data-testid={`listing-card-${listing.ID}`}
            >
              <div className="flex items-center gap-3">
                {listing.primaryPhotoUrl ? (
                  <Image
                    src={listing.primaryPhotoUrl}
                    alt={`${listing.make} ${listing.model}`}
                    width={56}
                    height={42}
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="h-[42px] w-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    -
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {listing.make} {listing.model} {listing.year || ""}
                  </p>
                  <p className="text-sm font-semibold">{formatPrice(listing.price)}</p>
                </div>
                {listing.marketPosition && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0",
                      MARKET_POSITION_COLORS[listing.marketPosition] || "",
                    )}
                  >
                    {MARKET_POSITION_LABELS[listing.marketPosition] || listing.marketPosition}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="size-3" /> {listing.viewCount}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="size-3" /> {listing.chatCount}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-3" /> {listing.daysOnMarket ?? "-"}j
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-3" /> {listing.visibilityScore}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SortHeader({
  column,
  label,
  sort,
  onSort,
}: {
  column: SellerListingSortColumn;
  label: string;
  sort: SortState;
  onSort: (column: SellerListingSortColumn) => void;
}) {
  return (
    <th className="pb-2 font-medium">
      <button
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onSort(column)}
        data-testid={`sort-${column}`}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "size-3",
            sort.column === column ? "text-foreground" : "text-muted-foreground/50",
          )}
        />
      </button>
    </th>
  );
}
