"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, ArrowUpDown } from "lucide-react";
import type { ISellerListingHistoryItem } from "@auto/shared";
import { getListingHistory } from "@/lib/api/lifecycle-api";
import { ListingHistoryCard } from "@/components/listing/listing-history-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortField = "date" | "views" | "days";
type StatusFilter = "all" | "published" | "sold" | "archived";

export default function SellerHistoryPage() {
  const [listings, setListings] = useState<ISellerListingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getListingHistory();
      setListings(data);
    } catch {
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredAndSorted = useMemo(() => {
    let result = [...listings];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date":
          cmp =
            new Date(a.publishedAt || a.soldAt || "").getTime() -
            new Date(b.publishedAt || b.soldAt || "").getTime();
          break;
        case "views":
          cmp = a.viewCount - b.viewCount;
          break;
        case "days":
          cmp = (a.daysOnMarket ?? 0) - (b.daysOnMarket ?? 0);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [listings, statusFilter, sortField, sortAsc]);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Historique des annonces</h1>
          <p className="text-sm text-muted-foreground mt-1 sm:mt-2 sm:text-base">
            Consultez vos annonces passees et actuelles.
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
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Historique des annonces</h1>
        <p className="text-sm text-muted-foreground mt-1 sm:mt-2 sm:text-base">
          {listings.length} annonce{listings.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      {/* Filters & sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger
              className="w-[140px] sm:w-[160px] min-h-11 sm:min-h-9"
              data-testid="status-filter"
            >
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="published">En ligne</SelectItem>
              <SelectItem value="sold">Vendu</SelectItem>
              <SelectItem value="archived">Archive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
            <SelectTrigger
              className="w-[140px] sm:w-[160px] min-h-11 sm:min-h-9"
              data-testid="sort-select"
            >
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="views">Vues</SelectItem>
              <SelectItem value="days">Jours en ligne</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortAsc((prev) => !prev)}
          className="self-start sm:self-auto min-h-11 sm:min-h-9"
          data-testid="sort-direction"
        >
          <ArrowUpDown className="h-4 w-4 mr-1" />
          {sortAsc ? "Croissant" : "Decroissant"}
        </Button>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-state">
          <p className="text-muted-foreground">
            {statusFilter !== "all"
              ? "Aucune annonce avec ce statut."
              : "Aucun historique d'annonces."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4" data-testid="history-grid">
          {filteredAndSorted.map((listing) => (
            <ListingHistoryCard key={listing.ID} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
