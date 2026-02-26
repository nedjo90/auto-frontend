"use client";

import { useState, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { loginRedirect } from "@/lib/auth/auth-utils";
import { addToMarketWatch, removeFromMarketWatch } from "@/lib/api/market-watch-api";
import { cn } from "@/lib/utils";

export interface FollowButtonProps {
  listingId: string;
  isWatching?: boolean;
  size?: "sm" | "default";
  className?: string;
  onToggle?: (watching: boolean) => void;
}

/**
 * "Suivre" / "Suivi" toggle button for market watch.
 * Only shown to authenticated sellers viewing competitor listings.
 * Uses optimistic UI with rollback on error.
 */
export function FollowButton({
  listingId,
  isWatching = false,
  size = "default",
  className,
  onToggle,
}: FollowButtonProps) {
  const { isAuthenticated } = useCurrentUser();
  const [watching, setWatching] = useState(isWatching);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated) {
        loginRedirect().catch(() => {});
        return;
      }

      if (isLoading) return;

      const previousState = watching;
      setWatching(!watching);
      setIsLoading(true);

      try {
        if (previousState) {
          await removeFromMarketWatch(listingId);
          onToggle?.(false);
          toast.success("Annonce retirée du suivi");
        } else {
          const result = await addToMarketWatch(listingId);
          setWatching(result.watching);
          onToggle?.(result.watching);
          toast.success("Annonce ajoutée au suivi marché");
        }
      } catch {
        setWatching(previousState);
        toast.error("Erreur lors de la mise à jour du suivi");
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, isLoading, watching, listingId, onToggle],
  );

  return (
    <Button
      variant={watching ? "default" : "outline"}
      size={size === "sm" ? "sm" : "default"}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={watching ? "Ne plus suivre" : "Suivre cette annonce"}
      data-testid="follow-button"
      className={cn(
        "gap-1.5 transition-colors",
        watching && "bg-blue-600 text-white hover:bg-blue-700",
        className,
      )}
    >
      {watching ? (
        <>
          <Eye className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span>Suivi</span>
        </>
      ) : (
        <>
          <EyeOff className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
          <span>Suivre</span>
        </>
      )}
    </Button>
  );
}
