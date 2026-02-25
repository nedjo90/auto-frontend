import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getNotificationsV2,
  markNotificationsReadV2,
  getUnreadCountV2,
  updateNotificationPreference,
  getNotificationPreferences,
  registerPushSubscription,
  unregisterPushSubscription,
  getPushSubscriptions,
} from "@/lib/api/notifications-api";

const mockApiClient = vi.fn();

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

function mockResponse(data: unknown, ok = true) {
  return {
    ok,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

describe("notifications-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNotificationsV2", () => {
    it("should fetch notifications from /api/notifications", async () => {
      mockApiClient.mockResolvedValue(
        mockResponse({
          items: JSON.stringify([{ ID: "notif-1", type: "price_change" }]),
          total: 1,
          unreadCount: 1,
          hasMore: false,
        }),
      );

      const result = await getNotificationsV2({ skip: 0, top: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].ID).toBe("notif-1");
      expect(result.total).toBe(1);
      expect(result.unreadCount).toBe(1);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/notifications/getNotifications"),
        expect.any(Object),
      );
    });

    it("should throw on error response", async () => {
      mockApiClient.mockResolvedValue(mockResponse({}, false));

      await expect(getNotificationsV2()).rejects.toThrow(
        "Erreur lors du chargement des notifications",
      );
    });
  });

  describe("markNotificationsReadV2", () => {
    it("should mark all as read", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ success: true, updated: 5 }));

      const result = await markNotificationsReadV2("all");

      expect(result.success).toBe(true);
      expect(result.updated).toBe(5);
    });

    it("should mark specific IDs as read", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ success: true, updated: 2 }));

      const result = await markNotificationsReadV2(["notif-1", "notif-2"]);

      expect(result.success).toBe(true);
    });

    it("should throw on error", async () => {
      mockApiClient.mockResolvedValue(mockResponse({}, false));

      await expect(markNotificationsReadV2("all")).rejects.toThrow();
    });
  });

  describe("getUnreadCountV2", () => {
    it("should return unread count", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ count: 7 }));

      const count = await getUnreadCountV2();
      expect(count).toBe(7);
    });

    it("should return 0 on error", async () => {
      mockApiClient.mockResolvedValue(mockResponse({}, false));

      const count = await getUnreadCountV2();
      expect(count).toBe(0);
    });
  });

  describe("updateNotificationPreference", () => {
    it("should update preference", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ success: true }));

      const result = await updateNotificationPreference("price_change", false);
      expect(result.success).toBe(true);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/notifications/updatePreference"),
        expect.objectContaining({
          body: JSON.stringify({ type: "price_change", enabled: false }),
        }),
      );
    });

    it("should throw on error", async () => {
      mockApiClient.mockResolvedValue(mockResponse({}, false));

      await expect(updateNotificationPreference("price_change", false)).rejects.toThrow();
    });
  });

  describe("getNotificationPreferences", () => {
    it("should return preferences", async () => {
      const prefs = [{ ID: "p1", userId: "u1", type: "price_change", enabled: true }];
      mockApiClient.mockResolvedValue(mockResponse({ preferences: JSON.stringify(prefs) }));

      const result = await getNotificationPreferences();
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("price_change");
    });
  });

  describe("registerPushSubscription", () => {
    it("should register subscription", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ subscriptionId: "sub-1" }));

      const result = await registerPushSubscription({
        endpoint: "https://push.example.com",
        p256dhKey: "key",
        authKey: "auth",
      });
      expect(result.subscriptionId).toBe("sub-1");
    });
  });

  describe("unregisterPushSubscription", () => {
    it("should unregister subscription", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ success: true }));

      const result = await unregisterPushSubscription("sub-1");
      expect(result.success).toBe(true);
    });
  });

  describe("getPushSubscriptions", () => {
    it("should return subscriptions", async () => {
      const subs = [{ ID: "sub-1", endpoint: "https://push.example.com" }];
      mockApiClient.mockResolvedValue(mockResponse({ subscriptions: JSON.stringify(subs) }));

      const result = await getPushSubscriptions();
      expect(result).toHaveLength(1);
    });

    it("should return empty on error", async () => {
      mockApiClient.mockResolvedValue(mockResponse({}, false));

      const result = await getPushSubscriptions();
      expect(result).toHaveLength(0);
    });
  });
});
