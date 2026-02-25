import { describe, it, expect, beforeEach } from "vitest";
import { useNotificationStore } from "@/stores/notification-store";
import type { INotification } from "@auto/shared";

const makeNotif = (overrides: Partial<INotification> = {}): INotification => ({
  ID: "notif-1",
  userId: "user-1",
  type: "price_change",
  title: "Changement de prix",
  body: "Le prix a baissé",
  message: "Le prix a baissé",
  actionUrl: "/listing/123",
  listingId: "listing-123",
  isRead: false,
  createdAt: "2026-02-20T10:00:00Z",
  ...overrides,
});

describe("notification-store", () => {
  beforeEach(() => {
    useNotificationStore.getState().reset();
  });

  it("should start with empty state", () => {
    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(0);
    expect(state.unreadCount).toBe(0);
    expect(state.connectionStatus).toBe("disconnected");
    expect(state.hasMore).toBe(false);
    expect(state.total).toBe(0);
  });

  it("should set notifications", () => {
    const store = useNotificationStore.getState();
    const notifs = [makeNotif(), makeNotif({ ID: "notif-2" })];
    store.setNotifications(notifs);

    expect(useNotificationStore.getState().notifications).toHaveLength(2);
  });

  it("should prepend notification", () => {
    const store = useNotificationStore.getState();
    store.setNotifications([makeNotif({ ID: "notif-old" })]);
    store.setTotal(1);

    store.prependNotification(makeNotif({ ID: "notif-new" }));

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(2);
    expect(state.notifications[0].ID).toBe("notif-new");
    expect(state.total).toBe(2);
  });

  it("should mark specific notifications as read", () => {
    const store = useNotificationStore.getState();
    store.setNotifications([
      makeNotif({ ID: "notif-1", isRead: false }),
      makeNotif({ ID: "notif-2", isRead: false }),
      makeNotif({ ID: "notif-3", isRead: false }),
    ]);
    store.setUnreadCount(3);

    store.markAsRead(["notif-1", "notif-3"]);

    const state = useNotificationStore.getState();
    expect(state.notifications[0].isRead).toBe(true);
    expect(state.notifications[1].isRead).toBe(false);
    expect(state.notifications[2].isRead).toBe(true);
    expect(state.unreadCount).toBe(1);
  });

  it("should mark all as read", () => {
    const store = useNotificationStore.getState();
    store.setNotifications([
      makeNotif({ ID: "notif-1", isRead: false }),
      makeNotif({ ID: "notif-2", isRead: false }),
    ]);
    store.setUnreadCount(2);

    store.markAllAsRead();

    const state = useNotificationStore.getState();
    expect(state.notifications.every((n) => n.isRead)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it("should not decrement unread below 0", () => {
    const store = useNotificationStore.getState();
    store.setUnreadCount(1);
    store.setNotifications([
      makeNotif({ ID: "notif-1", isRead: false }),
      makeNotif({ ID: "notif-2", isRead: false }),
    ]);

    store.markAsRead(["notif-1", "notif-2"]);

    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });

  it("should set connection status", () => {
    useNotificationStore.getState().setConnectionStatus("connected");
    expect(useNotificationStore.getState().connectionStatus).toBe("connected");
  });

  it("should set unread count", () => {
    useNotificationStore.getState().setUnreadCount(42);
    expect(useNotificationStore.getState().unreadCount).toBe(42);
  });

  it("should set hasMore", () => {
    useNotificationStore.getState().setHasMore(true);
    expect(useNotificationStore.getState().hasMore).toBe(true);
  });

  it("should set total", () => {
    useNotificationStore.getState().setTotal(100);
    expect(useNotificationStore.getState().total).toBe(100);
  });

  it("should reset to initial state", () => {
    const store = useNotificationStore.getState();
    store.setNotifications([makeNotif()]);
    store.setUnreadCount(5);
    store.setConnectionStatus("connected");
    store.setTotal(10);

    store.reset();

    const state = useNotificationStore.getState();
    expect(state.notifications).toHaveLength(0);
    expect(state.unreadCount).toBe(0);
    expect(state.connectionStatus).toBe("disconnected");
    expect(state.total).toBe(0);
  });
});
