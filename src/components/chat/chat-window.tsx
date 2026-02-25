"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "./chat-header";
import { ChatMessageBubble } from "./chat-message-bubble";
import { ChatInput } from "./chat-input";
import { useChat } from "@/hooks/use-chat";
import { toast } from "sonner";

interface ChatWindowProps {
  conversationId: string;
  userId: string;
  listingTitle: string;
  listingPhoto: string | null;
  listingPrice: number | null;
  onBack?: () => void;
}

export function ChatWindow({
  conversationId,
  userId,
  listingTitle,
  listingPhoto,
  listingPrice,
  onBack,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoadingMessages, hasMoreMessages, sendMessage, loadMore, markAsRead } =
    useChat({ conversationId, userId, enabled: true });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark received messages as read when viewing
  useEffect(() => {
    const unreadIds = messages
      .filter((m) => m.senderId !== userId && m.deliveryStatus !== "read")
      .map((m) => m.ID);

    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  }, [messages, userId, markAsRead]);

  const handleSend = async (content: string) => {
    try {
      await sendMessage(content);
    } catch {
      toast.error("Échec de l'envoi du message");
    }
  };

  return (
    <div className="flex h-full flex-col" data-testid="chat-window">
      <ChatHeader
        listingTitle={listingTitle}
        listingPhoto={listingPhoto}
        listingPrice={listingPrice}
        onBack={onBack}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chat-messages">
        {hasMoreMessages && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMore}
              disabled={isLoadingMessages}
              data-testid="chat-load-more"
            >
              {isLoadingMessages ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
              ) : null}
              Charger les messages précédents
            </Button>
          </div>
        )}

        {isLoadingMessages && messages.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        {!isLoadingMessages && messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8" data-testid="chat-empty">
            Aucun message. Envoyez le premier !
          </p>
        )}

        {messages.map((msg) => (
          <ChatMessageBubble key={msg.ID} message={msg} isOwn={msg.senderId === userId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}
