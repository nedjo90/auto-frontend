import { create } from "zustand";
import type { INotification } from "@auto/shared";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface NotificationState {
  /** Recent notifications list. */
  notifications: INotification[];
  /** Total unread count. */
  unreadCount: number;
  /** SignalR connection status. */
  connectionStatus: ConnectionStatus;
  /** Whether there are more notifications to load. */
  hasMore: boolean;
  /** Total notification count. */
  total: number;

  // Actions
  setNotifications: (notifications: INotification[]) => void;
  prependNotification: (notification: INotification) => void;
  markAsRead: (ids: string[]) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setHasMore: (hasMore: boolean) => void;
  setTotal: (total: number) => void;
  reset: () => void;
}

const initialState = {
  notifications: [] as INotification[],
  unreadCount: 0,
  connectionStatus: "disconnected" as ConnectionStatus,
  hasMore: false,
  total: 0,
};

export const useNotificationStore = create<NotificationState>((set) => ({
  ...initialState,

  setNotifications: (notifications) => set({ notifications }),

  prependNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      total: state.total + 1,
    })),

  markAsRead: (ids) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        ids.includes(n.ID) ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(
        0,
        state.unreadCount -
          state.notifications.filter((n) => ids.includes(n.ID) && !n.isRead).length,
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  setUnreadCount: (unreadCount) => set({ unreadCount }),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setHasMore: (hasMore) => set({ hasMore }),

  setTotal: (total) => set({ total }),

  reset: () => set(initialState),
}));
