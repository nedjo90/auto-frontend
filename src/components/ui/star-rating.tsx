"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
};

export function StarRating({ rating, maxRating = 5, size = "md", className }: StarRatingProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => {
    const filled = i < Math.floor(rating);
    const half = !filled && i < rating;

    return (
      <Star
        key={i}
        className={cn(
          sizeMap[size],
          filled
            ? "fill-yellow-400 text-yellow-400"
            : half
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-muted-foreground/30",
        )}
        aria-hidden="true"
      />
    );
  });

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rating} sur ${maxRating} étoiles`}
    >
      {stars}
    </div>
  );
}
