"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FileText, ShoppingBag, Upload, History, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SellerKpiGrid } from "@/components/seller/seller-kpi-grid";
import { SellerListingsTable } from "@/components/seller/seller-listings-table";
import { MetricDrilldown } from "@/components/seller/metric-drilldown";
import { MarketPositionDetail } from "@/components/seller/market-position-detail";
import { EmptyStateCockpit } from "@/components/dashboard/empty-state-cockpit";
import { getAggregateKPIs, getListingPerformance } from "@/lib/api/seller-kpi-api";
import type { ISellerKpiSummary, ISellerListingPerformance, SellerKpiMetric } from "@auto/shared";
import type { SellerListingSortColumn } from "@auto/shared";

const SELLER_SECTIONS = [
  {
    href: "/seller/drafts",
    icon: FileText,
    title: "Mes brouillons",
    description: "Creez et editez vos annonces",
  },
  {
    href: "/seller/listings",
    icon: ShoppingBag,
    title: "Mes annonces en ligne",
    description: "Gerez vos annonces publiees",
  },
  {
    href: "/seller/publish",
    icon: Upload,
    title: "Publier",
    description: "Publiez vos brouillons prets",
  },
  {
    href: "/seller/history",
    icon: History,
    title: "Historique",
    description: "Consultez vos annonces passees",
  },
  {
    href: "/seller/market",
    icon: Eye,
    title: "Suivi marché",
    description: "Surveillez les annonces concurrentes",
  },
];

export default function SellerCockpitPage() {
  const [kpis, setKpis] = useState<ISellerKpiSummary | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [listings, setListings] = useState<ISellerListingPerformance[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [drilldownMetric, setDrilldownMetric] = useState<SellerKpiMetric | null>(null);
  const [marketDetailListingId, setMarketDetailListingId] = useState<string | null>(null);

  useEffect(() => {
    getAggregateKPIs()
      .then(setKpis)
      .catch(() => setKpis(null))
      .finally(() => setKpiLoading(false));

    getListingPerformance()
      .then((data) => setListings(data.listings))
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false));
  }, []);

  const handleSort = useCallback((column: SellerListingSortColumn, dir: "asc" | "desc") => {
    setListingsLoading(true);
    getListingPerformance({ sortBy: column, sortDir: dir })
      .then((data) => setListings(data.listings))
      .catch(() => {
        // Keep current listings on sort failure; just stop loading
      })
      .finally(() => setListingsLoading(false));
  }, []);

  const handleKpiClick = useCallback((metric: SellerKpiMetric) => {
    setDrilldownMetric(metric);
  }, []);

  const handleMarketClick = useCallback((listingId: string) => {
    setMarketDetailListingId(listingId);
  }, []);

  // Show empty state when seller has no listings at all.
  // Also trigger when KPIs fail (kpis===null) but listings are confirmed empty.
  const isEmptyState =
    !kpiLoading &&
    !listingsLoading &&
    listings.length === 0 &&
    (kpis === null || kpis.activeListings.current === 0);

  if (isEmptyState) {
    return (
      <div className="space-y-4 sm:space-y-6" data-testid="seller-cockpit-empty">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Cockpit Vendeur</h1>
        </div>
        <EmptyStateCockpit />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Cockpit Vendeur</h1>
        <p className="text-sm text-muted-foreground mt-1 sm:mt-2 sm:text-base">
          Gerez vos annonces et suivez vos performances.
        </p>
      </div>

      {/* KPI Grid */}
      <SellerKpiGrid kpis={kpis} loading={kpiLoading} onKpiClick={handleKpiClick} />

      {/* Drilldown */}
      {drilldownMetric && (
        <MetricDrilldown metric={drilldownMetric} onClose={() => setDrilldownMetric(null)} />
      )}

      {/* Market Position Detail */}
      {marketDetailListingId &&
        (() => {
          const selected = listings.find((l) => l.ID === marketDetailListingId);
          return selected ? (
            <MarketPositionDetail
              listing={selected}
              onClose={() => setMarketDetailListingId(null)}
            />
          ) : null;
        })()}

      {/* Listings Performance Table */}
      <SellerListingsTable
        listings={listings}
        loading={listingsLoading}
        onSort={handleSort}
        onMarketClick={handleMarketClick}
      />

      {/* Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {SELLER_SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm sm:text-base">{section.title}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {section.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
