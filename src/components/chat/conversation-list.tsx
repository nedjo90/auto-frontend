"use client";

import { Loader2, MessageCircle } from "lucide-react";
import type { IConversationListItem } from "@auto/shared";
import { ConversationItem } from "./conversation-item";

interface ConversationListProps {
  conversations: IConversationListItem[];
  activeConversationId: string | null;
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  isLoading,
  onSelect,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        data-testid="conversation-list-loading"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-12 px-4"
        data-testid="conversation-list-empty"
      >
        <MessageCircle className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground text-center">
          Aucune conversation pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y" data-testid="conversation-list">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.conversationId}
          conversation={conv}
          isActive={conv.conversationId === activeConversationId}
          onClick={() => onSelect(conv.conversationId)}
        />
      ))}
    </div>
  );
}
