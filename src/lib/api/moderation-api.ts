import type {
  IConfigReportReason,
  IReportSubmissionResult,
  IReport,
  IReportMetrics,
  IReportDetail,
  IModerationActionResult,
  ReportStatus,
  ReportTargetType,
  ReportSortOption,
} from "@auto/shared";
import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Filters for the moderation report queue. */
export interface ReportQueueFilters {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  severity?: string;
  sortBy?: ReportSortOption;
  skip?: number;
  top?: number;
}

/** Paginated report queue result. */
export interface ReportQueueResult {
  items: IReport[];
  total: number;
  hasMore: boolean;
}

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

// ─── Moderator queue endpoints ──────────────────────────────────────────────

/** Fetch paginated report queue with filters. */
export async function fetchReportQueue(
  filters: ReportQueueFilters = {},
): Promise<ReportQueueResult> {
  const res = await apiClient(`${API_BASE}/api/moderation/getReportQueue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement des signalements: ${res.status}`);
  }

  const data = await res.json();
  return {
    items: typeof data.items === "string" ? JSON.parse(data.items) : data.items || [],
    total: data.total || 0,
    hasMore: data.hasMore || false,
  };
}

/** Fetch report queue metrics summary. */
export async function fetchReportMetrics(): Promise<IReportMetrics> {
  const res = await apiClient(`${API_BASE}/api/moderation/getReportMetrics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement des métriques: ${res.status}`);
  }

  return res.json();
}

/** Fetch full report detail with context. */
export async function fetchReportDetail(reportId: string): Promise<IReportDetail> {
  const res = await apiClient(`${API_BASE}/api/moderation/getReportDetail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId }),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error("Rapport introuvable");
    throw new Error(`Erreur lors du chargement du rapport: ${res.status}`);
  }

  const text = await res.text();
  // Backend returns JSON-stringified detail
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    throw new Error("Format de réponse invalide");
  }
}

/** Assign a report to the current moderator. */
export async function assignReport(
  reportId: string,
): Promise<{ success: boolean; status: string }> {
  const res = await apiClient(`${API_BASE}/api/moderation/assignReport`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId }),
  });

  if (res.status === 409) {
    throw new Error("Ce rapport est déjà en cours de traitement par un autre modérateur");
  }
  if (!res.ok) {
    throw new Error(`Erreur lors de l'attribution du rapport: ${res.status}`);
  }

  return res.json();
}

// ─── Moderator action endpoints ─────────────────────────────────────────────

/** Deactivate (suspend) a listing. */
export async function deactivateListing(input: {
  reportId: string;
  listingId: string;
  reason?: string;
}): Promise<IModerationActionResult> {
  const res = await apiClient(`${API_BASE}/api/moderation/deactivateListing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Erreur: ${res.status}`);
  }

  return res.json();
}

/** Send a warning to a user. */
export async function sendWarning(input: {
  reportId: string;
  userId: string;
  warningMessage?: string;
}): Promise<IModerationActionResult> {
  const res = await apiClient(`${API_BASE}/api/moderation/sendWarning`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Erreur: ${res.status}`);
  }

  return res.json();
}

/** Deactivate (suspend) a user account. */
export async function deactivateAccount(input: {
  reportId?: string;
  userId: string;
  reason?: string;
  confirmed: boolean;
}): Promise<IModerationActionResult> {
  const res = await apiClient(`${API_BASE}/api/moderation/deactivateAccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Erreur: ${res.status}`);
  }

  return res.json();
}

/** Reactivate a suspended listing. */
export async function reactivateListing(input: {
  listingId: string;
  reason?: string;
}): Promise<IModerationActionResult> {
  const res = await apiClient(`${API_BASE}/api/moderation/reactivateListing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Erreur: ${res.status}`);
  }

  return res.json();
}

/** Reactivate a suspended user account. */
export async function reactivateAccount(input: {
  userId: string;
  reason?: string;
}): Promise<IModerationActionResult> {
  const res = await apiClient(`${API_BASE}/api/moderation/reactivateAccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Erreur: ${res.status}`);
  }

  return res.json();
}

/** Fetch seller moderation history. */
export async function fetchSellerHistory(
  sellerId: string,
): Promise<import("@auto/shared").ISellerHistory> {
  const res = await apiClient(`${API_BASE}/api/moderation/getSellerHistory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sellerId }),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error("Vendeur introuvable");
    throw new Error(`Erreur lors du chargement de l'historique: ${res.status}`);
  }

  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    throw new Error("Format de reponse invalide");
  }
}

/** Dismiss a report. */
export async function dismissReport(input: {
  reportId: string;
  reason?: string;
}): Promise<IModerationActionResult> {
  const res = await apiClient(`${API_BASE}/api/moderation/dismissReport`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Erreur: ${res.status}`);
  }

  return res.json();
}
