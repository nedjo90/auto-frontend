import type { INotification, INotificationPreference, IPushSubscription } from "@auto/shared";
import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Get user's notifications (paginated). */
export async function getNotificationsV2(options?: { skip?: number; top?: number }): Promise<{
  items: INotification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}> {
  const res = await apiClient(`${API_BASE}/api/notifications/getNotifications`, {
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
export async function markNotificationsReadV2(
  notificationIds: string[] | "all",
): Promise<{ success: boolean; updated: number }> {
  const res = await apiClient(`${API_BASE}/api/notifications/markNotificationsRead`, {
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

/** Get unread notification count. */
export async function getUnreadCountV2(): Promise<number> {
  const res = await apiClient(`${API_BASE}/api/notifications/getUnreadCount`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return 0;

  const data = await res.json();
  return data.count || 0;
}

/** Update a notification preference. */
export async function updateNotificationPreference(
  type: string,
  enabled: boolean,
): Promise<{ success: boolean }> {
  const res = await apiClient(`${API_BASE}/api/notifications/updatePreference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, enabled }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la mise à jour de la préférence");
  }

  return res.json();
}

/** Get all notification preferences. */
export async function getNotificationPreferences(): Promise<INotificationPreference[]> {
  const res = await apiClient(`${API_BASE}/api/notifications/getPreferences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des préférences");
  }

  const data = await res.json();
  return typeof data.preferences === "string"
    ? JSON.parse(data.preferences)
    : data.preferences || [];
}

/** Register a push subscription. */
export async function registerPushSubscription(sub: {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  deviceLabel?: string;
}): Promise<{ subscriptionId: string }> {
  const res = await apiClient(`${API_BASE}/api/notifications/registerPushSubscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l'enregistrement push");
  }

  return res.json();
}

/** Unregister a push subscription. */
export async function unregisterPushSubscription(
  subscriptionId: string,
): Promise<{ success: boolean }> {
  const res = await apiClient(`${API_BASE}/api/notifications/unregisterPushSubscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscriptionId }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la suppression de la souscription");
  }

  return res.json();
}

/** Get user's push subscriptions. */
export async function getPushSubscriptions(): Promise<IPushSubscription[]> {
  const res = await apiClient(`${API_BASE}/api/notifications/getPushSubscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return typeof data.subscriptions === "string"
    ? JSON.parse(data.subscriptions)
    : data.subscriptions || [];
}
