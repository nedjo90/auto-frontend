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
  // Use individual selectors to avoid full-store re-renders
  const messages = useChatStore((s) => s.messages);
  const connectionStatus = useChatStore((s) => s.connectionStatus);
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages);
  const hasMoreMessages = useChatStore((s) => s.hasMoreMessages);
  const totalUnreadCount = useChatStore((s) => s.totalUnreadCount);
  const messageCursor = useChatStore((s) => s.messageCursor);

  const prevConvRef = useRef<string | null>(null);
  const markedAsReadRef = useRef<Set<string>>(new Set());

  // Handle incoming SignalR events
  const handleMessageSent = useCallback(
    (data: unknown) => {
      const event = data as IChatMessageEvent;
      const state = useChatStore.getState();
      // Add message to store if it's for the active conversation
      if (event.conversationId === state.activeConversationId) {
        const message: IChatMessage = {
          ID: event.messageId,
          conversationId: event.conversationId,
          senderId: event.senderId,
          content: event.content,
          timestamp: event.timestamp,
          deliveryStatus: "delivered",
        };
        state.addMessage(message);

        // Auto-mark as delivered
        if (userId && event.senderId !== userId) {
          apiMarkAsDelivered(event.conversationId, [event.messageId]).catch(() => {});
        }
      }

      // Update conversation list
      state.updateConversationLastMessage(event.conversationId, event.content, event.timestamp);

      // Increment unread if not active conversation
      if (event.conversationId !== state.activeConversationId) {
        state.setTotalUnreadCount(state.totalUnreadCount + 1);
      }
    },
    [userId],
  );

  const handleMessageDelivered = useCallback((data: unknown) => {
    const event = data as IChatStatusEvent;
    useChatStore.getState().updateMessageStatus(event.messageId, "delivered");
  }, []);

  const handleMessageRead = useCallback((data: unknown) => {
    const event = data as IChatStatusEvent;
    useChatStore.getState().updateMessageStatus(event.messageId, "read");
  }, []);

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
    useChatStore.getState().setConnectionStatus(status);
  }, [status]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId || conversationId === prevConvRef.current) return;
    prevConvRef.current = conversationId;
    markedAsReadRef.current = new Set();

    const state = useChatStore.getState();
    state.setActiveConversation(conversationId);
    state.setIsLoadingMessages(true);

    getMessages(conversationId)
      .then((result) => {
        const s = useChatStore.getState();
        // Messages come in desc order from API, reverse for display
        s.setMessages(result.messages.reverse());
        s.setHasMoreMessages(result.hasMore);
        s.setMessageCursor(result.cursor);
      })
      .catch(() => {})
      .finally(() => {
        useChatStore.getState().setIsLoadingMessages(false);
      });
  }, [conversationId]);

  // Load unread count on mount
  useEffect(() => {
    if (!userId || !enabled) return;
    getChatUnreadCount()
      .then((count) => useChatStore.getState().setTotalUnreadCount(count))
      .catch(() => {});
  }, [userId, enabled]);

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
      useChatStore.getState().addMessage(optimisticMsg);

      try {
        const result = await apiSendMessage(conversationId, content);
        // Replace temp message with real one
        const state = useChatStore.getState();
        state.setMessages(
          state.messages.map((m) =>
            m.ID === tempId
              ? {
                  ...m,
                  ID: result.messageId,
                  timestamp: result.timestamp,
                  deliveryStatus: result.deliveryStatus,
                }
              : m,
          ),
        );
        state.updateConversationLastMessage(conversationId, content, result.timestamp);
      } catch {
        // Remove optimistic message on failure
        const state = useChatStore.getState();
        state.setMessages(state.messages.filter((m) => m.ID !== tempId));
        throw new Error("Échec de l'envoi du message");
      }
    },
    [conversationId, userId],
  );

  // Load older messages
  const loadMore = useCallback(async () => {
    const state = useChatStore.getState();
    if (!conversationId || !state.hasMoreMessages || state.isLoadingMessages) return;

    state.setIsLoadingMessages(true);
    try {
      const result = await getMessages(conversationId, {
        cursor: state.messageCursor ?? undefined,
      });
      const s = useChatStore.getState();
      s.prependMessages(result.messages.reverse());
      s.setHasMoreMessages(result.hasMore);
      s.setMessageCursor(result.cursor);
    } catch {
      // silently fail
    } finally {
      useChatStore.getState().setIsLoadingMessages(false);
    }
  }, [conversationId]);

  // Mark messages as read (with dedup to prevent repeated API calls)
  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      if (!conversationId || messageIds.length === 0) return;

      // Filter out already-marked IDs
      const newIds = messageIds.filter((id) => !markedAsReadRef.current.has(id));
      if (newIds.length === 0) return;

      // Track immediately to prevent duplicate calls
      for (const id of newIds) {
        markedAsReadRef.current.add(id);
      }

      try {
        const result = await apiMarkAsRead(conversationId, newIds);
        if (result.updated > 0) {
          const state = useChatStore.getState();
          state.decrementUnreadCount(conversationId, result.updated);
          for (const id of newIds) {
            state.updateMessageStatus(id, "read");
          }
        }
      } catch {
        // Remove from tracking on failure so they can be retried
        for (const id of newIds) {
          markedAsReadRef.current.delete(id);
        }
      }
    },
    [conversationId],
  );

  return {
    messages,
    connectionStatus,
    isLoadingMessages,
    hasMoreMessages,
    totalUnreadCount,
    sendMessage,
    loadMore,
    markAsRead,
  };
}
