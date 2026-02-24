import { apiClient } from "@/lib/auth/api-client";
import type { HistoryResponse } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface HistoryReportResult {
  reportId: string;
  source: string;
  fetchedAt: string;
  reportVersion: string;
  reportData: HistoryResponse;
  isMockData: boolean;
}

export interface FetchHistoryReportResult {
  reportId: string;
  source: string;
  fetchedAt: string;
  reportVersion: string;
  reportData: HistoryResponse;
}

export async function getBuyerHistoryReport(listingId: string): Promise<HistoryReportResult> {
  const res = await apiClient(`${API_BASE}/api/buyer/getHistoryReport`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to load history report: ${res.status} ${errorText}`);
  }

  const data = await res.json();

  return {
    reportId: data.reportId,
    source: data.source,
    fetchedAt: data.fetchedAt,
    reportVersion: data.reportVersion,
    reportData: typeof data.reportData === "string" ? JSON.parse(data.reportData) : data.reportData,
    isMockData: data.isMockData,
  };
}

export async function fetchSellerHistoryReport(listingId: string): Promise<FetchHistoryReportResult> {
  const res = await apiClient(`${API_BASE}/api/seller/fetchHistoryReport`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch history report: ${res.status} ${errorText}`);
  }

  const data = await res.json();

  return {
    reportId: data.reportId,
    source: data.source,
    fetchedAt: data.fetchedAt,
    reportVersion: data.reportVersion,
    reportData: typeof data.reportData === "string" ? JSON.parse(data.reportData) : data.reportData,
  };
}
