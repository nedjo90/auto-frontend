import { apiClient } from "@/lib/auth/api-client";
import type {
  ISellerKpiSummary,
  ISellerListingPerformance,
  IMetricDrilldownData,
  SellerKpiMetric,
} from "@auto/shared";
import type { SellerListingSortColumn } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Fetch aggregate KPIs for the seller dashboard. */
export async function getAggregateKPIs(): Promise<ISellerKpiSummary> {
  const res = await apiClient(`${API_BASE}/api/seller/getAggregateKPIs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch KPIs: ${res.status} ${text}`);
  }

  const data = await res.json();
  return typeof data.kpis === "string" ? JSON.parse(data.kpis) : data.kpis;
}

/** Fetch listing performance data for the seller table. */
export async function getListingPerformance(options?: {
  sortBy?: SellerListingSortColumn;
  sortDir?: "asc" | "desc";
  skip?: number;
  top?: number;
}): Promise<{ listings: ISellerListingPerformance[]; total: number }> {
  const res = await apiClient(`${API_BASE}/api/seller/getListingPerformance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sortBy: options?.sortBy || "viewCount",
      sortDir: options?.sortDir || "desc",
      skip: options?.skip || 0,
      top: options?.top || 20,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch listing performance: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    listings: typeof data.listings === "string" ? JSON.parse(data.listings) : data.listings || [],
    total: data.total || 0,
  };
}

/** Fetch metric drilldown time-series data. */
export async function getMetricDrilldown(
  metric: SellerKpiMetric,
  options?: { listingId?: string; periodDays?: number },
): Promise<IMetricDrilldownData> {
  const res = await apiClient(`${API_BASE}/api/seller/getMetricDrilldown`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      metric,
      listingId: options?.listingId || null,
      periodDays: options?.periodDays || 30,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch drilldown: ${res.status} ${text}`);
  }

  const data = await res.json();
  return typeof data.drilldown === "string" ? JSON.parse(data.drilldown) : data.drilldown;
}
