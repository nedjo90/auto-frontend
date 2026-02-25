import { create } from "zustand";
import type { IChatMessage, IConversationListItem, MessageDeliveryStatus } from "@auto/shared";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface ChatState {
  /** Currently active conversation ID. */
  activeConversationId: string | null;
  /** Messages for the active conversation. */
  messages: IChatMessage[];
  /** Conversation list items. */
  conversations: IConversationListItem[];
  /** SignalR connection status. */
  connectionStatus: ConnectionStatus;
  /** Total unread count across all conversations. */
  totalUnreadCount: number;
  /** Whether more messages can be loaded (pagination). */
  hasMoreMessages: boolean;
  /** Cursor for message pagination. */
  messageCursor: string | null;
  /** Loading state for messages. */
  isLoadingMessages: boolean;

  // Actions
  setActiveConversation: (id: string | null) => void;
  setMessages: (messages: IChatMessage[]) => void;
  prependMessages: (messages: IChatMessage[]) => void;
  addMessage: (message: IChatMessage) => void;
  updateMessageStatus: (messageId: string, status: MessageDeliveryStatus) => void;
  setConversations: (conversations: IConversationListItem[]) => void;
  updateConversationLastMessage: (
    conversationId: string,
    content: string,
    timestamp: string,
  ) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setTotalUnreadCount: (count: number) => void;
  decrementUnreadCount: (conversationId: string, count: number) => void;
  setHasMoreMessages: (hasMore: boolean) => void;
  setMessageCursor: (cursor: string | null) => void;
  setIsLoadingMessages: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  activeConversationId: null,
  messages: [],
  conversations: [],
  connectionStatus: "disconnected" as ConnectionStatus,
  totalUnreadCount: 0,
  hasMoreMessages: false,
  messageCursor: null,
  isLoadingMessages: false,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  setActiveConversation: (id) =>
    set({ activeConversationId: id, messages: [], hasMoreMessages: false, messageCursor: null }),

  setMessages: (messages) => set({ messages }),

  prependMessages: (olderMessages) =>
    set((state) => ({ messages: [...olderMessages, ...state.messages] })),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.ID === messageId ? { ...m, deliveryStatus: status } : m,
      ),
    })),

  setConversations: (conversations) => set({ conversations }),

  updateConversationLastMessage: (conversationId, content, timestamp) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.conversationId === conversationId
          ? { ...c, lastMessage: content, lastMessageAt: timestamp }
          : c,
      ),
    })),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setTotalUnreadCount: (totalUnreadCount) => set({ totalUnreadCount }),

  decrementUnreadCount: (conversationId, count) =>
    set((state) => ({
      totalUnreadCount: Math.max(0, state.totalUnreadCount - count),
      conversations: state.conversations.map((c) =>
        c.conversationId === conversationId
          ? { ...c, unreadCount: Math.max(0, c.unreadCount - count) }
          : c,
      ),
    })),

  setHasMoreMessages: (hasMoreMessages) => set({ hasMoreMessages }),

  setMessageCursor: (messageCursor) => set({ messageCursor }),

  setIsLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),

  reset: () => set(initialState),
}));
