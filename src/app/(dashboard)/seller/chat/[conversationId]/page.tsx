"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ChatWindow } from "@/components/chat/chat-window";
import { getConversations } from "@/lib/api/chat-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { IConversationListItem } from "@auto/shared";

export default function SellerChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const { userId } = useCurrentUser();
  const [conv, setConv] = useState<IConversationListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset loading state when conversationId changes
    setIsLoading(true);
    getConversations({ top: 100 })
      .then((result) => {
        const found = result.items.find((c) => c.conversationId === conversationId);
        setConv(found ?? null);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (!conv || !userId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Conversation introuvable</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border bg-background overflow-hidden h-[70vh]"
      data-testid="seller-chat-thread"
    >
      <ChatWindow
        conversationId={conversationId}
        userId={userId}
        listingTitle={conv.listingTitle}
        listingPhoto={conv.listingPhoto}
        listingPrice={conv.listingPrice}
        onBack={() => router.push("/seller/chat")}
      />
    </div>
  );
}
