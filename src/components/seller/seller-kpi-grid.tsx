"use client";

import { KpiCard } from "@/components/admin/kpi-card";
import { KpiCardSkeleton } from "@/components/admin/kpi-card-skeleton";
import type { ISellerKpiSummary, SellerKpiMetric } from "@auto/shared";
import { SELLER_KPI_LABELS } from "@auto/shared";

export interface SellerKpiGridProps {
  kpis: ISellerKpiSummary | null;
  loading: boolean;
  onKpiClick?: (metric: SellerKpiMetric) => void;
}

const KPI_ORDER: { metric: SellerKpiMetric; format: "number" | "currency" }[] = [
  { metric: "activeListings", format: "number" },
  { metric: "totalViews", format: "number" },
  { metric: "totalContacts", format: "number" },
  { metric: "avgDaysOnline", format: "number" },
];

export function SellerKpiGrid({ kpis, loading, onKpiClick }: SellerKpiGridProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        data-testid="kpi-grid-skeleton"
      >
        {KPI_ORDER.map((k) => (
          <KpiCardSkeleton key={k.metric} />
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" data-testid="seller-kpi-grid">
      {KPI_ORDER.map((k) => (
        <KpiCard
          key={k.metric}
          label={SELLER_KPI_LABELS[k.metric]}
          data={kpis[k.metric]}
          format={k.format}
          onClick={onKpiClick ? () => onKpiClick(k.metric) : undefined}
        />
      ))}
    </div>
  );
}
