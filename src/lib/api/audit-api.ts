import { apiClient } from "@/lib/auth/api-client";
import type { IAuditTrailEntry, IApiCallLog } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** OData response wrapper */
interface ODataResponse<T> {
  value: T[];
  "@odata.count"?: number;
}

export interface AuditTrailFilters {
  dateFrom?: string;
  dateTo?: string;
  action?: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  severity?: string;
}

export interface ApiCallLogFilters {
  dateFrom?: string;
  dateTo?: string;
  provider?: string;
  adapter?: string;
  httpStatus?: string;
  listingId?: string;
}

/** Escape single quotes for OData string literals. */
function escapeOData(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Fetch audit trail entries with OData filtering, sorting, and pagination.
 */
export async function fetchAuditTrailEntries(
  filters: AuditTrailFilters = {},
  orderBy: string = "timestamp desc",
  top: number = 25,
  skip: number = 0,
): Promise<{ entries: IAuditTrailEntry[]; count: number }> {
  const params = new URLSearchParams();
  params.set("$count", "true");
  params.set("$top", String(top));
  params.set("$skip", String(skip));
  params.set("$orderby", orderBy);

  const filterParts: string[] = [];
  if (filters.dateFrom) filterParts.push(`timestamp ge ${filters.dateFrom}`);
  if (filters.dateTo) filterParts.push(`timestamp le ${filters.dateTo}`);
  if (filters.action) filterParts.push(`action eq '${escapeOData(filters.action)}'`);
  if (filters.actorId) filterParts.push(`contains(actorId,'${escapeOData(filters.actorId)}')`);
  if (filters.targetType) filterParts.push(`targetType eq '${escapeOData(filters.targetType)}'`);
  if (filters.targetId) filterParts.push(`contains(targetId,'${escapeOData(filters.targetId)}')`);
  if (filters.severity) filterParts.push(`severity eq '${escapeOData(filters.severity)}'`);

  if (filterParts.length > 0) {
    params.set("$filter", filterParts.join(" and "));
  }

  const res = await apiClient(`${API_BASE}/api/admin/AuditTrailEntries?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch audit trail: ${res.status}`);
  }
  const data: ODataResponse<IAuditTrailEntry> = await res.json();
  return {
    entries: data.value ?? [],
    count: data["@odata.count"] ?? data.value?.length ?? 0,
  };
}

/**
 * Fetch API call log entries with OData filtering, sorting, and pagination.
 */
export async function fetchApiCallLogs(
  filters: ApiCallLogFilters = {},
  orderBy: string = "timestamp desc",
  top: number = 25,
  skip: number = 0,
): Promise<{ entries: IApiCallLog[]; count: number }> {
  const params = new URLSearchParams();
  params.set("$count", "true");
  params.set("$top", String(top));
  params.set("$skip", String(skip));
  params.set("$orderby", orderBy);

  const filterParts: string[] = [];
  if (filters.dateFrom) filterParts.push(`timestamp ge ${filters.dateFrom}`);
  if (filters.dateTo) filterParts.push(`timestamp le ${filters.dateTo}`);
  if (filters.provider) filterParts.push(`providerKey eq '${escapeOData(filters.provider)}'`);
  if (filters.adapter) filterParts.push(`adapterInterface eq '${escapeOData(filters.adapter)}'`);
  if (filters.listingId)
    filterParts.push(`contains(listingId,'${escapeOData(filters.listingId)}')`);

  if (filterParts.length > 0) {
    params.set("$filter", filterParts.join(" and "));
  }

  const res = await apiClient(`${API_BASE}/api/admin/ApiCallLogs?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch API call logs: ${res.status}`);
  }
  const data: ODataResponse<IApiCallLog> = await res.json();
  return {
    entries: data.value ?? [],
    count: data["@odata.count"] ?? data.value?.length ?? 0,
  };
}

/**
 * Export audit trail entries as CSV.
 */
export async function exportAuditTrailCsv(filters: AuditTrailFilters = {}): Promise<string> {
  const res = await apiClient(`${API_BASE}/api/admin/exportAuditTrail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) {
    throw new Error(`Failed to export audit trail: ${res.status}`);
  }
  const data = await res.json();
  return data.value ?? data;
}

/**
 * Export API call logs as CSV.
 */
export async function exportApiCallLogsCsv(filters: ApiCallLogFilters = {}): Promise<string> {
  const res = await apiClient(`${API_BASE}/api/admin/exportApiCallLogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) {
    throw new Error(`Failed to export API call logs: ${res.status}`);
  }
  const data = await res.json();
  return data.value ?? data;
}
