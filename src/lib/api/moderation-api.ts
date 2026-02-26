import type { IConfigReportReason, IReportSubmissionResult } from "@auto/shared";
import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Fetch active report reasons from the moderation service. */
export async function fetchReportReasons(): Promise<IConfigReportReason[]> {
  const res = await apiClient(`${API_BASE}/api/moderation/ReportReasons?$filter=active eq true`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement des raisons: ${res.status}`);
  }

  const data = await res.json();
  return data.value || [];
}

/** Submit an abuse report. */
export async function submitReport(input: {
  targetType: string;
  targetId: string;
  reasonId: string;
  description: string;
}): Promise<IReportSubmissionResult> {
  const res = await apiClient(`${API_BASE}/api/moderation/submitReport`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (res.status === 429) {
    throw new Error("Vous avez atteint la limite de signalements pour aujourd'hui");
  }
  if (res.status === 409) {
    throw new Error("Vous avez déjà signalé cette cible");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Erreur: ${res.status}`);
  }

  return res.json();
}
