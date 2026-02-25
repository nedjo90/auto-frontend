"use client";

import { useEffect, useCallback, useMemo, useRef } from "react";
import type { INotification, INotificationEvent, IUnreadCountEvent } from "@auto/shared";
import { NOTIFICATION_HUB_NAME, NOTIFICATION_EVENTS } from "@auto/shared";
import { useSignalR } from "./use-signalr";
import { useNotificationStore } from "@/stores/notification-store";
import { useCurrentUser } from "./use-current-user";
import {
  getNotificationsV2,
  markNotificationsReadV2,
  getUnreadCountV2,
} from "@/lib/api/notifications-api";

/**
 * Hook providing real-time notification management via SignalR.
 * Replaces the polling-based approach in NotificationBell.
 */
export function useNotifications() {
  const { isAuthenticated } = useCurrentUser();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const connectionStatus = useNotificationStore((s) => s.connectionStatus);
  const hasMore = useNotificationStore((s) => s.hasMore);
  const total = useNotificationStore((s) => s.total);
  const initialLoadRef = useRef(false);

  // SignalR event handlers
  const events = useMemo(
    () => ({
      [NOTIFICATION_EVENTS.newNotification]: (data: unknown) => {
        const event = data as INotificationEvent;
        const store = useNotificationStore.getState();

        const newNotification: INotification = {
          ID: event.notificationId,
          userId: "",
          type: event.type,
          title: event.title,
          body: event.body,
          message: event.body,
          actionUrl: event.actionUrl,
          listingId: event.listingId,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        store.prependNotification(newNotification);
        // Don't manually increment unreadCount here — the server sends
        // a separate unreadCountUpdate event with the authoritative count.
      },
      [NOTIFICATION_EVENTS.unreadCountUpdate]: (data: unknown) => {
        const event = data as IUnreadCountEvent;
        useNotificationStore.getState().setUnreadCount(event.count);
      },
    }),
    [],
  );

  const { status } = useSignalR({
    hubPath: NOTIFICATION_HUB_NAME,
    events,
    enabled: isAuthenticated,
  });

  // Sync SignalR status to store
  useEffect(() => {
    useNotificationStore.getState().setConnectionStatus(status);
  }, [status]);

  // Initial load of notifications and unread count
  useEffect(() => {
    if (!isAuthenticated || initialLoadRef.current) return;
    initialLoadRef.current = true;

    async function load() {
      try {
        const [data, count] = await Promise.all([
          getNotificationsV2({ top: 10 }),
          getUnreadCountV2(),
        ]);
        const store = useNotificationStore.getState();
        store.setNotifications(data.items);
        store.setUnreadCount(count);
        store.setHasMore(data.hasMore);
        store.setTotal(data.total);
      } catch {
        // Silently fail - will retry on next mount
      }
    }

    load();
  }, [isAuthenticated]);

  // Fallback polling when SignalR is unavailable
  useEffect(() => {
    if (!isAuthenticated || status === "connected") return;

    const interval = setInterval(async () => {
      try {
        const count = await getUnreadCountV2();
        useNotificationStore.getState().setUnreadCount(count);
      } catch {
        // Silently fail
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, status]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      initialLoadRef.current = false;
      useNotificationStore.getState().reset();
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const store = useNotificationStore.getState();
    const prevNotifications = store.notifications;
    const prevUnreadCount = store.unreadCount;
    store.markAsRead(ids);
    try {
      await markNotificationsReadV2(ids);
    } catch {
      // Rollback on failure
      store.setNotifications(prevNotifications);
      store.setUnreadCount(prevUnreadCount);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const store = useNotificationStore.getState();
    const prevNotifications = store.notifications;
    const prevUnreadCount = store.unreadCount;
    store.markAllAsRead();
    try {
      await markNotificationsReadV2("all");
    } catch {
      // Rollback on failure
      store.setNotifications(prevNotifications);
      store.setUnreadCount(prevUnreadCount);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await getNotificationsV2({ top: 10 });
      const store = useNotificationStore.getState();
      store.setNotifications(data.items);
      store.setUnreadCount(data.unreadCount);
      store.setHasMore(data.hasMore);
      store.setTotal(data.total);
    } catch {
      // Silently fail
    }
  }, []);

  return {
    notifications,
    unreadCount,
    connectionStatus,
    hasMore,
    total,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
