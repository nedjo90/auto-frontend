import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Allowlisted entity names that can be accessed via the config API. */
const VALID_ENTITIES = new Set([
  "ConfigParameters",
  "ConfigTexts",
  "ConfigFeatures",
  "ConfigBoostFactors",
  "ConfigVehicleTypes",
  "ConfigListingDurations",
  "ConfigReportReasons",
  "ConfigChatActions",
  "ConfigModerationRules",
  "ConfigApiProviders",
  "ConfigRegistrationFields",
  "ConfigProfileFields",
  "ConfigAlerts",
  "ConfigSeoTemplates",
  "LegalDocuments",
  "LegalDocumentVersions",
  "LegalAcceptances",
  "AuditTrailEntries",
  "ApiCallLogs",
  "AlertEvents",
]);

function validateEntityName(entityName: string): void {
  if (!VALID_ENTITIES.has(entityName)) {
    throw new Error(`Invalid config entity name: ${entityName}`);
  }
}

/** OData response wrapper */
interface ODataResponse<T> {
  value: T[];
}

/**
 * Fetch all entries from a config entity via the AdminService.
 */
export async function fetchConfigEntities<T>(entityName: string): Promise<T[]> {
  validateEntityName(entityName);
  const res = await apiClient(`${API_BASE}/api/admin/${entityName}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${entityName}: ${res.status}`);
  }
  const data: ODataResponse<T> = await res.json();
  return data.value ?? [];
}

/**
 * Update a single config entity by ID via OData PATCH.
 */
export async function updateConfigEntity<T extends Record<string, unknown>>(
  entityName: string,
  id: string,
  payload: Partial<T>,
): Promise<void> {
  validateEntityName(entityName);
  const res = await apiClient(`${API_BASE}/api/admin/${entityName}(${id})`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to update ${entityName}: ${res.status} ${errorText}`);
  }
}

/**
 * Create a new config entity via OData POST.
 */
export async function createConfigEntity<T extends Record<string, unknown>>(
  entityName: string,
  payload: T,
): Promise<T> {
  validateEntityName(entityName);
  const res = await apiClient(`${API_BASE}/api/admin/${entityName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to create ${entityName}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Delete a config entity by ID via OData DELETE.
 */
export async function deleteConfigEntity(entityName: string, id: string): Promise<void> {
  validateEntityName(entityName);
  const res = await apiClient(`${API_BASE}/api/admin/${entityName}(${id})`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete ${entityName}: ${res.status}`);
  }
}

/** Impact estimation result from backend */
export interface ConfigImpactResult {
  affectedCount: number;
  message: string;
}

/**
 * Estimate the impact of changing a config parameter.
 */
export async function estimateConfigImpact(parameterKey: string): Promise<ConfigImpactResult> {
  const res = await apiClient(`${API_BASE}/api/admin/estimateConfigImpact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parameterKey }),
  });
  if (!res.ok) {
    throw new Error(`Failed to estimate impact: ${res.status}`);
  }
  return res.json();
}

/** Cost summary result from backend */
export interface ApiCostSummary {
  totalCost: number;
  callCount: number;
  avgCostPerCall: number;
  byProvider: string;
}

/** Provider analytics result from backend */
export interface ProviderAnalytics {
  avgResponseTimeMs: number;
  successRate: number;
  totalCalls: number;
  totalCost: number;
  avgCostPerCall: number;
  lastCallTimestamp: string | null;
}

/** Switch provider result from backend */
export interface SwitchProviderResult {
  success: boolean;
  message: string;
}

/**
 * Fetch API cost summary for a given period.
 */
export async function fetchApiCostSummary(period: string): Promise<ApiCostSummary> {
  const res = await apiClient(`${API_BASE}/api/admin/getApiCostSummary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ period }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch cost summary: ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch analytics for a specific provider.
 */
export async function fetchProviderAnalytics(providerKey: string): Promise<ProviderAnalytics> {
  const res = await apiClient(`${API_BASE}/api/admin/getProviderAnalytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerKey }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch provider analytics: ${res.status}`);
  }
  return res.json();
}

/**
 * Switch the active provider for an adapter interface.
 */
export async function switchProvider(
  adapterInterface: string,
  newProviderKey: string,
): Promise<SwitchProviderResult> {
  const res = await apiClient(`${API_BASE}/api/admin/switchProvider`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adapterInterface, newProviderKey }),
  });
  if (!res.ok) {
    throw new Error(`Failed to switch provider: ${res.status}`);
  }
  return res.json();
}
