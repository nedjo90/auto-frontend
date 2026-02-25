import type {
  IFavoriteEnriched,
  IFavoriteCheckResult,
  IFavoriteToggleResult,
  INotification,
} from "@auto/shared";
import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Toggle favorite status for a listing. */
export async function toggleFavorite(listingId: string): Promise<IFavoriteToggleResult> {
  const res = await apiClient(`${API_BASE}/api/favorites/toggleFavorite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur lors de la mise à jour des favoris: ${res.status} ${text}`);
  }

  return res.json();
}

/** Check which listings are favorited by the current user. */
export async function checkFavorites(listingIds: string[]): Promise<IFavoriteCheckResult[]> {
  if (listingIds.length === 0) return [];

  const res = await apiClient(`${API_BASE}/api/favorites/checkFavorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingIds: JSON.stringify(listingIds) }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  return typeof data.results === "string" ? JSON.parse(data.results) : data.results || [];
}

/** Get user's favorites with enriched listing data and change detection. */
export async function getMyFavorites(options?: {
  skip?: number;
  top?: number;
}): Promise<{ items: IFavoriteEnriched[]; total: number; hasMore: boolean }> {
  const res = await apiClient(`${API_BASE}/api/favorites/getMyFavorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skip: options?.skip || 0, top: options?.top || 20 }),
  });

  if (!res.ok) {
    throw new Error(`Erreur lors du chargement des favoris: ${res.status}`);
  }

  const data = await res.json();
  return {
    items: typeof data.items === "string" ? JSON.parse(data.items) : data.items || [],
    total: data.total || 0,
    hasMore: data.hasMore || false,
  };
}

/** Mark all favorite snapshots as seen. */
export async function markAllAsSeen(): Promise<{ success: boolean; updated: number }> {
  const res = await apiClient(`${API_BASE}/api/favorites/markAllAsSeen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la mise à jour");
  }

  return res.json();
}

/** Get user's notifications. */
export async function getNotifications(options?: { skip?: number; top?: number }): Promise<{
  items: INotification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}> {
  const res = await apiClient(`${API_BASE}/api/favorites/getNotifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skip: options?.skip || 0, top: options?.top || 20 }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des notifications");
  }

  const data = await res.json();
  return {
    items: typeof data.items === "string" ? JSON.parse(data.items) : data.items || [],
    total: data.total || 0,
    unreadCount: data.unreadCount || 0,
    hasMore: data.hasMore || false,
  };
}

/** Mark notifications as read. */
export async function markNotificationsRead(
  notificationIds: string[] | "all",
): Promise<{ success: boolean; updated: number }> {
  const res = await apiClient(`${API_BASE}/api/favorites/markNotificationsRead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      notificationIds: notificationIds === "all" ? "all" : JSON.stringify(notificationIds),
    }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la mise à jour des notifications");
  }

  return res.json();
}

/** Get unread notification count (for bell badge). */
export async function getUnreadCount(): Promise<number> {
  const res = await apiClient(`${API_BASE}/api/favorites/getUnreadCount`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return 0;

  const data = await res.json();
  return data.count || 0;
}
