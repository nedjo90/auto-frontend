import type {
  IStartConversationResult,
  ISendMessageResult,
  IConversationListItem,
  IChatMessagePage,
} from "@auto/shared";
import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Start or resume a conversation for a listing. */
export async function startOrResumeConversation(
  listingId: string,
  buyerId: string,
): Promise<IStartConversationResult> {
  const res = await apiClient(`${API_BASE}/api/chat/startOrResumeConversation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId, buyerId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur lors de l'ouverture de la conversation: ${res.status} ${text}`);
  }

  return res.json();
}

/** Send a message in a conversation. */
export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ISendMessageResult> {
  const res = await apiClient(`${API_BASE}/api/chat/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, content }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur lors de l'envoi du message: ${res.status} ${text}`);
  }

  return res.json();
}

/** Get user's conversations. */
export async function getConversations(options?: {
  skip?: number;
  top?: number;
}): Promise<{ items: IConversationListItem[]; total: number; hasMore: boolean }> {
  const res = await apiClient(`${API_BASE}/api/chat/getConversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skip: options?.skip || 0, top: options?.top || 20 }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des conversations");
  }

  const data = await res.json();
  return {
    items: typeof data.items === "string" ? JSON.parse(data.items) : data.items || [],
    total: data.total || 0,
    hasMore: data.hasMore || false,
  };
}

/** Get messages for a conversation with cursor-based pagination. */
export async function getMessages(
  conversationId: string,
  options?: { cursor?: string; limit?: number },
): Promise<IChatMessagePage> {
  const res = await apiClient(`${API_BASE}/api/chat/getMessages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversationId,
      cursor: options?.cursor,
      limit: options?.limit || 50,
    }),
  });

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des messages");
  }

  const data = await res.json();
  return {
    messages: typeof data.messages === "string" ? JSON.parse(data.messages) : data.messages || [],
    hasMore: data.hasMore || false,
    cursor: data.cursor || null,
  };
}

/** Mark messages as delivered. */
export async function markAsDelivered(
  conversationId: string,
  messageIds: string[],
): Promise<{ success: boolean; updated: number }> {
  const res = await apiClient(`${API_BASE}/api/chat/markAsDelivered`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, messageIds: JSON.stringify(messageIds) }),
  });

  if (!res.ok) return { success: false, updated: 0 };
  return res.json();
}

/** Mark messages as read. */
export async function markAsRead(
  conversationId: string,
  messageIds: string[],
): Promise<{ success: boolean; updated: number }> {
  const res = await apiClient(`${API_BASE}/api/chat/markAsRead`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, messageIds: JSON.stringify(messageIds) }),
  });

  if (!res.ok) return { success: false, updated: 0 };
  return res.json();
}

/** Get unread message count across all conversations. */
export async function getChatUnreadCount(): Promise<number> {
  const res = await apiClient(`${API_BASE}/api/chat/getUnreadCount`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return 0;
  const data = await res.json();
  return data.count || 0;
}
