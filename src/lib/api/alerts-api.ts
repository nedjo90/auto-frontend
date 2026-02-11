import { apiClient } from "@/lib/auth/api-client";
import type { IAlertEvent } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function fetchActiveAlerts(): Promise<IAlertEvent[]> {
  const res = await apiClient(`${API_BASE}/api/admin/getActiveAlerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch active alerts: ${res.status}`);
  }
  return res.json();
}

export async function acknowledgeAlert(
  alertEventId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await apiClient(`${API_BASE}/api/admin/acknowledgeAlert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alertEventId }),
  });
  if (!res.ok) {
    throw new Error(`Failed to acknowledge alert: ${res.status}`);
  }
  return res.json();
}
