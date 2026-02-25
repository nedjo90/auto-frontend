"use client";

import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { loginRedirect } from "@/lib/auth/auth-utils";
import { toggleFavorite } from "@/lib/api/favorites-api";
import { cn } from "@/lib/utils";

export interface FavoriteButtonProps {
  listingId: string;
  isFavorited?: boolean;
  size?: "sm" | "default";
  className?: string;
  onToggle?: (favorited: boolean) => void;
}

/**
 * Heart icon button that toggles listing favorite status.
 * Requires authentication — redirects to login if not authenticated.
 * Uses optimistic UI with rollback on error.
 */
export function FavoriteButton({
  listingId,
  isFavorited = false,
  size = "default",
  className,
  onToggle,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useCurrentUser();
  const [isFav, setIsFav] = useState(isFavorited);
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

      const previousState = isFav;
      setIsFav(!isFav);
      setIsLoading(true);

      try {
        const result = await toggleFavorite(listingId);
        setIsFav(result.favorited);
        onToggle?.(result.favorited);
        toast.success(result.favorited ? "Ajoutée aux favoris" : "Retirée des favoris");
      } catch {
        setIsFav(previousState);
        toast.error("Erreur lors de la mise à jour");
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, isLoading, isFav, listingId, onToggle],
  );

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "icon" : "default"}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
      data-testid="favorite-button"
      className={cn(
        "rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        className,
      )}
    >
      <Heart
        className={cn(
          "transition-colors",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          isFav ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-400",
        )}
        data-testid="favorite-heart-icon"
      />
    </Button>
  );
}
