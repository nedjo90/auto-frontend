import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "@/stores/chat-store";
import type { IChatMessage, IConversationListItem } from "@auto/shared";

const mockMessage: IChatMessage = {
  ID: "msg-1",
  conversationId: "conv-1",
  senderId: "user-1",
  content: "Hello",
  timestamp: "2026-02-25T10:00:00Z",
  deliveryStatus: "sent",
};

const mockConversation: IConversationListItem = {
  conversationId: "conv-1",
  listingId: "listing-1",
  listingTitle: "BMW Serie 3 (2020)",
  listingPhoto: null,
  listingPrice: 25000,
  otherPartyId: "user-2",
  otherPartyName: "Jean Dupont",
  lastMessage: "Bonjour",
  lastMessageAt: "2026-02-25T10:00:00Z",
  unreadCount: 2,
};

describe("Chat Store", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  describe("activeConversation", () => {
    it("should set active conversation and reset messages", () => {
      useChatStore.getState().addMessage(mockMessage);
      expect(useChatStore.getState().messages).toHaveLength(1);

      useChatStore.getState().setActiveConversation("conv-2");
      expect(useChatStore.getState().activeConversationId).toBe("conv-2");
      expect(useChatStore.getState().messages).toHaveLength(0);
    });

    it("should clear active conversation", () => {
      useChatStore.getState().setActiveConversation("conv-1");
      useChatStore.getState().setActiveConversation(null);
      expect(useChatStore.getState().activeConversationId).toBeNull();
    });
  });

  describe("messages", () => {
    it("should add a message", () => {
      useChatStore.getState().addMessage(mockMessage);
      expect(useChatStore.getState().messages).toHaveLength(1);
      expect(useChatStore.getState().messages[0]).toEqual(mockMessage);
    });

    it("should set messages", () => {
      const messages = [mockMessage, { ...mockMessage, ID: "msg-2" }];
      useChatStore.getState().setMessages(messages);
      expect(useChatStore.getState().messages).toHaveLength(2);
    });

    it("should prepend messages", () => {
      useChatStore.getState().addMessage(mockMessage);
      const older = { ...mockMessage, ID: "msg-0", timestamp: "2026-02-25T09:00:00Z" };
      useChatStore.getState().prependMessages([older]);
      expect(useChatStore.getState().messages[0].ID).toBe("msg-0");
      expect(useChatStore.getState().messages[1].ID).toBe("msg-1");
    });

    it("should update message status", () => {
      useChatStore.getState().addMessage(mockMessage);
      useChatStore.getState().updateMessageStatus("msg-1", "delivered");
      expect(useChatStore.getState().messages[0].deliveryStatus).toBe("delivered");
    });

    it("should not update non-existent message", () => {
      useChatStore.getState().addMessage(mockMessage);
      useChatStore.getState().updateMessageStatus("non-existent", "read");
      expect(useChatStore.getState().messages[0].deliveryStatus).toBe("sent");
    });
  });

  describe("conversations", () => {
    it("should set conversations", () => {
      useChatStore.getState().setConversations([mockConversation]);
      expect(useChatStore.getState().conversations).toHaveLength(1);
    });

    it("should update conversation last message", () => {
      useChatStore.getState().setConversations([mockConversation]);
      useChatStore
        .getState()
        .updateConversationLastMessage("conv-1", "New msg", "2026-02-25T11:00:00Z");
      const conv = useChatStore.getState().conversations[0];
      expect(conv.lastMessage).toBe("New msg");
      expect(conv.lastMessageAt).toBe("2026-02-25T11:00:00Z");
    });
  });

  describe("unread count", () => {
    it("should set total unread count", () => {
      useChatStore.getState().setTotalUnreadCount(5);
      expect(useChatStore.getState().totalUnreadCount).toBe(5);
    });

    it("should decrement unread count", () => {
      useChatStore.getState().setTotalUnreadCount(5);
      useChatStore.getState().setConversations([mockConversation]);
      useChatStore.getState().decrementUnreadCount("conv-1", 1);
      expect(useChatStore.getState().totalUnreadCount).toBe(4);
      expect(useChatStore.getState().conversations[0].unreadCount).toBe(1);
    });

    it("should not go below 0", () => {
      useChatStore.getState().setTotalUnreadCount(0);
      useChatStore.getState().setConversations([{ ...mockConversation, unreadCount: 0 }]);
      useChatStore.getState().decrementUnreadCount("conv-1", 3);
      expect(useChatStore.getState().totalUnreadCount).toBe(0);
      expect(useChatStore.getState().conversations[0].unreadCount).toBe(0);
    });
  });

  describe("connection status", () => {
    it("should update connection status", () => {
      useChatStore.getState().setConnectionStatus("connected");
      expect(useChatStore.getState().connectionStatus).toBe("connected");
    });
  });

  describe("pagination", () => {
    it("should set hasMoreMessages", () => {
      useChatStore.getState().setHasMoreMessages(true);
      expect(useChatStore.getState().hasMoreMessages).toBe(true);
    });

    it("should set messageCursor", () => {
      useChatStore.getState().setMessageCursor("2026-02-25T09:00:00Z");
      expect(useChatStore.getState().messageCursor).toBe("2026-02-25T09:00:00Z");
    });

    it("should set loading state", () => {
      useChatStore.getState().setIsLoadingMessages(true);
      expect(useChatStore.getState().isLoadingMessages).toBe(true);
    });
  });

  describe("reset", () => {
    it("should reset all state", () => {
      useChatStore.getState().setActiveConversation("conv-1");
      useChatStore.getState().addMessage(mockMessage);
      useChatStore.getState().setConversations([mockConversation]);
      useChatStore.getState().setTotalUnreadCount(5);
      useChatStore.getState().setConnectionStatus("connected");

      useChatStore.getState().reset();

      const state = useChatStore.getState();
      expect(state.activeConversationId).toBeNull();
      expect(state.messages).toHaveLength(0);
      expect(state.conversations).toHaveLength(0);
      expect(state.totalUnreadCount).toBe(0);
      expect(state.connectionStatus).toBe("disconnected");
    });
  });
});
