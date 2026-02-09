import { apiClient } from "@/lib/auth/api-client";
import type { IDashboardKpis, ITrendDataPoint } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Simple TTL cache for dashboard API responses (NFR5: <2s load time). */
const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return undefined;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearDashboardCache(): void {
  cache.clear();
}

/**
 * Fetch all dashboard KPIs for a given period.
 */
export async function fetchDashboardKpis(period: string): Promise<IDashboardKpis> {
  const cacheKey = `kpis:${period}`;
  const cached = getCached<IDashboardKpis>(cacheKey);
  if (cached) return cached;

  const res = await apiClient(`${API_BASE}/api/admin/getDashboardKpis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ period }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard KPIs: ${res.status}`);
  }
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

/**
 * Fetch trend data for a specific metric over N days.
 */
export async function fetchDashboardTrend(
  metric: string,
  days: number,
): Promise<ITrendDataPoint[]> {
  const cacheKey = `trend:${metric}:${days}`;
  const cached = getCached<ITrendDataPoint[]>(cacheKey);
  if (cached) return cached;

  const res = await apiClient(`${API_BASE}/api/admin/getDashboardTrend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metric, days }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard trend: ${res.status}`);
  }
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

/** Drill-down data point. */
export interface DrillDownEntry {
  date: string;
  value: number;
  [key: string]: unknown;
}

/**
 * Fetch drill-down data for a specific KPI metric.
 */
export async function fetchKpiDrillDown(metric: string, period: string): Promise<DrillDownEntry[]> {
  const cacheKey = `drilldown:${metric}:${period}`;
  const cached = getCached<DrillDownEntry[]>(cacheKey);
  if (cached) return cached;

  const res = await apiClient(`${API_BASE}/api/admin/getKpiDrillDown`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metric, period }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch drill-down data: ${res.status}`);
  }
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}
