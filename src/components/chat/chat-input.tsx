"use client";

import { useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHAT_MAX_MESSAGE_LENGTH } from "@auto/shared";

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      setContent("");
    } catch {
      // Error handled by caller
    } finally {
      setIsSending(false);
    }
  }, [content, isSending, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex items-end gap-2 border-t p-3" data-testid="chat-input">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Votre message..."
        maxLength={CHAT_MAX_MESSAGE_LENGTH}
        disabled={disabled || isSending}
        rows={1}
        className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        data-testid="chat-input-textarea"
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!content.trim() || isSending || disabled}
        data-testid="chat-send-button"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Envoyer</span>
      </Button>
    </div>
  );
}
