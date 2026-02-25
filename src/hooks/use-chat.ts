"use client";

import { useCallback, useEffect, useRef } from "react";
import type { IChatMessage, IChatMessageEvent, IChatStatusEvent } from "@auto/shared";
import { CHAT_EVENTS } from "@auto/shared";
import { useSignalR } from "./use-signalr";
import { useChatStore } from "@/stores/chat-store";
import {
  getMessages,
  sendMessage as apiSendMessage,
  markAsRead as apiMarkAsRead,
  markAsDelivered as apiMarkAsDelivered,
  getChatUnreadCount,
} from "@/lib/api/chat-api";

export interface UseChatOptions {
  conversationId: string | null;
  userId: string | null;
  enabled?: boolean;
}

/**
 * Hook for managing chat functionality: messages, SignalR events, and state.
 */
export function useChat({ conversationId, userId, enabled = true }: UseChatOptions) {
  const store = useChatStore();
  const prevConvRef = useRef<string | null>(null);

  // Handle incoming SignalR events
  const handleMessageSent = useCallback(
    (data: unknown) => {
      const event = data as IChatMessageEvent;
      // Add message to store if it's for the active conversation
      if (event.conversationId === useChatStore.getState().activeConversationId) {
        const message: IChatMessage = {
          ID: event.messageId,
          conversationId: event.conversationId,
          senderId: event.senderId,
          content: event.content,
          timestamp: event.timestamp,
          deliveryStatus: "delivered",
        };
        store.addMessage(message);

        // Auto-mark as delivered
        if (userId && event.senderId !== userId) {
          apiMarkAsDelivered(event.conversationId, [event.messageId]).catch(() => {});
        }
      }

      // Update conversation list
      store.updateConversationLastMessage(event.conversationId, event.content, event.timestamp);

      // Increment unread if not active conversation
      if (event.conversationId !== useChatStore.getState().activeConversationId) {
        store.setTotalUnreadCount(useChatStore.getState().totalUnreadCount + 1);
      }
    },
    [userId, store],
  );

  const handleMessageDelivered = useCallback(
    (data: unknown) => {
      const event = data as IChatStatusEvent;
      store.updateMessageStatus(event.messageId, "delivered");
    },
    [store],
  );

  const handleMessageRead = useCallback(
    (data: unknown) => {
      const event = data as IChatStatusEvent;
      store.updateMessageStatus(event.messageId, "read");
    },
    [store],
  );

  // Connect to SignalR chat hub
  const { status } = useSignalR({
    hubPath: "chat",
    events: {
      [CHAT_EVENTS.messageSent]: handleMessageSent,
      [CHAT_EVENTS.messageDelivered]: handleMessageDelivered,
      [CHAT_EVENTS.messageRead]: handleMessageRead,
    },
    enabled: enabled && !!userId,
  });

  useEffect(() => {
    store.setConnectionStatus(status);
  }, [status, store]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId || conversationId === prevConvRef.current) return;
    prevConvRef.current = conversationId;

    store.setActiveConversation(conversationId);
    store.setIsLoadingMessages(true);

    getMessages(conversationId)
      .then((result) => {
        // Messages come in desc order from API, reverse for display
        store.setMessages(result.messages.reverse());
        store.setHasMoreMessages(result.hasMore);
        store.setMessageCursor(result.cursor);
      })
      .catch(() => {})
      .finally(() => {
        store.setIsLoadingMessages(false);
      });
  }, [conversationId, store]);

  // Load unread count on mount
  useEffect(() => {
    if (!userId || !enabled) return;
    getChatUnreadCount()
      .then((count) => store.setTotalUnreadCount(count))
      .catch(() => {});
  }, [userId, enabled, store]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !userId) return;

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: IChatMessage = {
        ID: tempId,
        conversationId,
        senderId: userId,
        content,
        timestamp: new Date().toISOString(),
        deliveryStatus: "sent",
      };
      store.addMessage(optimisticMsg);

      try {
        const result = await apiSendMessage(conversationId, content);
        // Replace temp message with real one
        store.updateMessageStatus(tempId, result.deliveryStatus);
        // Update the ID from temp to real
        const state = useChatStore.getState();
        store.setMessages(
          state.messages.map((m) =>
            m.ID === tempId ? { ...m, ID: result.messageId, timestamp: result.timestamp } : m,
          ),
        );
        store.updateConversationLastMessage(conversationId, content, result.timestamp);
      } catch {
        // Remove optimistic message on failure
        const state = useChatStore.getState();
        store.setMessages(state.messages.filter((m) => m.ID !== tempId));
        throw new Error("Échec de l'envoi du message");
      }
    },
    [conversationId, userId, store],
  );

  // Load older messages
  const loadMore = useCallback(async () => {
    if (!conversationId || !store.hasMoreMessages || store.isLoadingMessages) return;

    store.setIsLoadingMessages(true);
    try {
      const result = await getMessages(conversationId, {
        cursor: store.messageCursor ?? undefined,
      });
      store.prependMessages(result.messages.reverse());
      store.setHasMoreMessages(result.hasMore);
      store.setMessageCursor(result.cursor);
    } catch {
      // silently fail
    } finally {
      store.setIsLoadingMessages(false);
    }
  }, [conversationId, store]);

  // Mark messages as read
  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!conversationId || messageIds.length === 0) return;
      try {
        const result = await apiMarkAsRead(conversationId, messageIds);
        if (result.updated > 0) {
          store.decrementUnreadCount(conversationId, result.updated);
          for (const id of messageIds) {
            store.updateMessageStatus(id, "read");
          }
        }
      } catch {
        // silently fail
      }
    },
    [conversationId, store],
  );

  return {
    messages: store.messages,
    connectionStatus: store.connectionStatus,
    isLoadingMessages: store.isLoadingMessages,
    hasMoreMessages: store.hasMoreMessages,
    totalUnreadCount: store.totalUnreadCount,
    sendMessage,
    loadMore,
    markAsRead,
  };
}
