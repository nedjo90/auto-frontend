"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Eye, Search, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { IMarketWatchEnriched } from "@auto/shared";
import { getMarketWatchList, removeFromMarketWatch } from "@/lib/api/market-watch-api";
import { MarketWatchCard } from "@/components/dashboard/market-watch-card";
import { Button } from "@/components/ui/button";

export default function MarketWatchPage() {
  const [watches, setWatches] = useState<IMarketWatchEnriched[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadWatches = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMarketWatchList();
      setWatches(data.items);
      setTotal(data.total);
    } catch {
      toast.error("Erreur lors du chargement du suivi marché");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatches();
  }, [loadWatches]);

  const handleRemove = useCallback(async (listingId: string) => {
    try {
      await removeFromMarketWatch(listingId);
      setWatches((prev) => prev.filter((w) => w.listingId !== listingId));
      setTotal((prev) => prev - 1);
      toast.success("Annonce retirée du suivi");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }, []);

  const hasChanges = watches.some((w) => w.hasChangedSinceLastVisit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="market-watch-loading">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (watches.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 space-y-4"
        data-testid="market-watch-empty"
      >
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Aucune annonce suivie</p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Parcourez les annonces concurrentes et cliquez sur &quot;Suivre&quot; pour surveiller
          leurs prix et changements
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
    <div className="space-y-6" data-testid="market-watch-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Suivi marché</h1>
          <p className="text-sm text-muted-foreground" data-testid="market-watch-count">
            {total} annonce{total > 1 ? "s" : ""} suivie{total > 1 ? "s" : ""}
          </p>
        </div>
        {hasChanges && (
          <Badge data-testid="changes-indicator">
            <Eye className="mr-1 h-3.5 w-3.5" />
            Des annonces ont changé depuis votre dernière visite
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="market-watch-grid">
        {watches.map((watch) => (
          <MarketWatchCard key={watch.ID} watch={watch} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
}

function Badge({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      {...props}
    >
      {children}
    </div>
  );
}
