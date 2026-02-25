"use client";

import { Check, CheckCheck } from "lucide-react";
import type { IChatMessage, MessageDeliveryStatus } from "@auto/shared";

interface ChatMessageBubbleProps {
  message: IChatMessage;
  isOwn: boolean;
}

function DeliveryIndicator({ status }: { status: MessageDeliveryStatus }) {
  switch (status) {
    case "read":
      return <CheckCheck className="h-3.5 w-3.5 text-blue-500" aria-label="Lu" />;
    case "delivered":
      return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" aria-label="Distribué" />;
    default:
      return <Check className="h-3.5 w-3.5 text-muted-foreground" aria-label="Envoyé" />;
  }
}

function formatTime(timestamp: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}

export function ChatMessageBubble({ message, isOwn }: ChatMessageBubbleProps) {
  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
      data-testid={`chat-message-${message.ID}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : ""}`}>
          <span className="text-[10px] opacity-70">{formatTime(message.timestamp)}</span>
          {isOwn && <DeliveryIndicator status={message.deliveryStatus} />}
        </div>
      </div>
    </div>
  );
}
