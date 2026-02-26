import type {
  IMarketWatchEnriched,
  IMarketWatchCheckResult,
  IMarketWatchToggleResult,
} from "@auto/shared";
import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Add a listing to market watch. */
export async function addToMarketWatch(
  listingId: string,
  notes?: string,
): Promise<IMarketWatchToggleResult> {
  const res = await apiClient(`${API_BASE}/api/seller/addToMarketWatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId, notes: notes ?? undefined }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur lors de l'ajout au suivi: ${res.status} ${text}`);
  }

  return res.json();
}

/** Remove a listing from market watch. */
export async function removeFromMarketWatch(listingId: string): Promise<{ success: boolean }> {
  const res = await apiClient(`${API_BASE}/api/seller/removeFromMarketWatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur lors de la suppression du suivi: ${res.status} ${text}`);
  }

  return res.json();
}

/** Get the seller's market watch list with enriched data. */
export async function getMarketWatchList(options?: {
  skip?: number;
  top?: number;
}): Promise<{ items: IMarketWatchEnriched[]; total: number }> {
  const res = await apiClient(`${API_BASE}/api/seller/getMarketWatchList`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skip: options?.skip ?? 0, top: options?.top ?? 20 }),
  });

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement du suivi marché: ${res.status}`);
  }

  const data = await res.json();
  return {
    items: typeof data.items === "string" ? JSON.parse(data.items) : data.items || [],
    total: data.total || 0,
  };
}

/** Check which listings are being watched by the current seller. */
export async function checkMarketWatches(listingIds: string[]): Promise<IMarketWatchCheckResult[]> {
  if (listingIds.length === 0) return [];

  const res = await apiClient(`${API_BASE}/api/seller/checkMarketWatches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingIds: JSON.stringify(listingIds) }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  return typeof data.results === "string" ? JSON.parse(data.results) : data.results || [];
}
