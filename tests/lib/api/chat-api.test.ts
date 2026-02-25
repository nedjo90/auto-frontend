import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = vi.fn();

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import {
  startOrResumeConversation,
  sendMessage,
  getConversations,
  getMessages,
  markAsDelivered,
  markAsRead,
  getChatUnreadCount,
} from "@/lib/api/chat-api";

function mockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

describe("Chat API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("startOrResumeConversation", () => {
    it("should call API and return result", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ conversationId: "conv-1", isNew: true }));

      const result = await startOrResumeConversation("listing-1", "buyer-1");
      expect(result).toEqual({ conversationId: "conv-1", isNew: true });
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/chat/startOrResumeConversation"),
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("should throw on error", async () => {
      mockApiClient.mockResolvedValue(mockResponse({}, false, 404));
      await expect(startOrResumeConversation("x", "y")).rejects.toThrow();
    });
  });

  describe("sendMessage", () => {
    it("should call API and return result", async () => {
      mockApiClient.mockResolvedValue(
        mockResponse({
          messageId: "msg-1",
          timestamp: "2026-02-25T10:00:00Z",
          deliveryStatus: "sent",
        }),
      );

      const result = await sendMessage("conv-1", "Hello");
      expect(result.messageId).toBe("msg-1");
    });

    it("should throw on error", async () => {
      mockApiClient.mockResolvedValue(mockResponse({}, false, 400));
      await expect(sendMessage("conv-1", "")).rejects.toThrow();
    });
  });

  describe("getConversations", () => {
    it("should return parsed items", async () => {
      mockApiClient.mockResolvedValue(
        mockResponse({
          items: JSON.stringify([{ conversationId: "conv-1" }]),
          total: 1,
          hasMore: false,
        }),
      );

      const result = await getConversations();
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it("should handle array items (not stringified)", async () => {
      mockApiClient.mockResolvedValue(
        mockResponse({
          items: [{ conversationId: "conv-1" }],
          total: 1,
          hasMore: false,
        }),
      );

      const result = await getConversations();
      expect(result.items).toHaveLength(1);
    });
  });

  describe("getMessages", () => {
    it("should return parsed messages with pagination", async () => {
      mockApiClient.mockResolvedValue(
        mockResponse({
          messages: JSON.stringify([{ ID: "msg-1" }]),
          hasMore: true,
          cursor: "2026-02-25T09:00:00Z",
        }),
      );

      const result = await getMessages("conv-1");
      expect(result.messages).toHaveLength(1);
      expect(result.hasMore).toBe(true);
      expect(result.cursor).toBe("2026-02-25T09:00:00Z");
    });
  });

  describe("markAsDelivered", () => {
    it("should return result on success", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ success: true, updated: 2 }));

      const result = await markAsDelivered("conv-1", ["msg-1", "msg-2"]);
      expect(result).toEqual({ success: true, updated: 2 });
    });

    it("should return failure on error", async () => {
      mockApiClient.mockResolvedValue(mockResponse({}, false, 500));
      const result = await markAsDelivered("conv-1", ["msg-1"]);
      expect(result).toEqual({ success: false, updated: 0 });
    });
  });

  describe("markAsRead", () => {
    it("should return result on success", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ success: true, updated: 1 }));

      const result = await markAsRead("conv-1", ["msg-1"]);
      expect(result).toEqual({ success: true, updated: 1 });
    });
  });

  describe("getChatUnreadCount", () => {
    it("should return count", async () => {
      mockApiClient.mockResolvedValue(mockResponse({ count: 5 }));

      const result = await getChatUnreadCount();
      expect(result).toBe(5);
    });

    it("should return 0 on error", async () => {
      mockApiClient.mockResolvedValue(mockResponse({}, false, 500));
      const result = await getChatUnreadCount();
      expect(result).toBe(0);
    });
  });
});
