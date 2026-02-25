"use client";

import { Badge } from "@/components/ui/badge";
import type { IConversationListItem } from "@auto/shared";

interface ConversationItemProps {
  conversation: IConversationListItem;
  isActive?: boolean;
  onClick: () => void;
}

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return "";
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}j`;
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
  } catch {
    return "";
  }
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
        isActive ? "bg-muted" : ""
      }`}
      data-testid={`conversation-item-${conversation.conversationId}`}
    >
      {/* Vehicle photo */}
      {conversation.listingPhoto ? (
        <img
          src={conversation.listingPhoto}
          alt={conversation.listingTitle}
          className="h-12 w-12 rounded-md object-cover shrink-0"
        />
      ) : (
        <div className="h-12 w-12 rounded-md bg-muted shrink-0 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Auto</span>
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{conversation.otherPartyName}</p>
          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{conversation.listingTitle}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {conversation.lastMessage || "Nouvelle conversation"}
        </p>
      </div>

      {/* Unread badge */}
      {conversation.unreadCount > 0 && (
        <Badge
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
          data-testid={`unread-badge-${conversation.conversationId}`}
        >
          {conversation.unreadCount}
        </Badge>
      )}
    </button>
  );
}
