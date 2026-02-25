"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { getConversations } from "@/lib/api/chat-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useIsMobile } from "@/hooks/use-mobile";
import type { IConversationListItem } from "@auto/shared";

export default function SellerChatPage() {
  const [conversations, setConversations] = useState<IConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<IConversationListItem | null>(null);
  const { userId } = useCurrentUser();
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    getConversations({ top: 50 })
      .then((result) => setConversations(result.items))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelect = (conversationId: string) => {
    const conv = conversations.find((c) => c.conversationId === conversationId);
    if (conv) {
      if (isMobile) {
        router.push(`/seller/chat/${conversationId}`);
      } else {
        setActiveConv(conv);
      }
    }
  };

  return (
    <div className="space-y-4" data-testid="seller-chat-page">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        <h1 className="text-xl font-bold sm:text-2xl">Messages</h1>
      </div>

      <div className="flex gap-0 rounded-lg border bg-background overflow-hidden min-h-[60vh]">
        {/* Conversation list */}
        <div
          className={`${
            activeConv && !isMobile ? "w-[340px] border-r" : "w-full"
          } shrink-0 overflow-y-auto`}
        >
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConv?.conversationId ?? null}
            isLoading={isLoading}
            onSelect={handleSelect}
          />
        </div>

        {/* Chat window (desktop split view) */}
        {activeConv && !isMobile && userId && (
          <div className="flex-1">
            <ChatWindow
              conversationId={activeConv.conversationId}
              userId={userId}
              listingTitle={activeConv.listingTitle}
              listingPhoto={activeConv.listingPhoto}
              listingPrice={activeConv.listingPrice}
              onBack={() => setActiveConv(null)}
            />
          </div>
        )}

        {/* Empty state for desktop when no conversation selected */}
        {!activeConv && !isMobile && conversations.length > 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
