"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  listingTitle: string;
  listingPhoto: string | null;
  listingPrice: number | null;
  onBack?: () => void;
}

function formatPrice(price: number | null): string {
  if (price == null) return "";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function ChatHeader({ listingTitle, listingPhoto, listingPrice, onBack }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3" data-testid="chat-header">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Retour</span>
        </Button>
      )}
      {listingPhoto && (
        <img
          src={listingPhoto}
          alt={listingTitle}
          className="h-10 w-10 rounded-md object-cover shrink-0"
          data-testid="chat-header-photo"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate" data-testid="chat-header-title">
          {listingTitle}
        </p>
        {listingPrice != null && (
          <p className="text-xs text-muted-foreground" data-testid="chat-header-price">
            {formatPrice(listingPrice)}
          </p>
        )}
      </div>
    </div>
  );
}
