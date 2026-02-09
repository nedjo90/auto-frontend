import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** OData response wrapper */
interface ODataResponse<T> {
  value: T[];
}

/**
 * Fetch all entries from a config entity via the AdminService.
 */
export async function fetchConfigEntities<T>(entityName: string): Promise<T[]> {
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
