"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";
import type { IPublicSellerProfile } from "@auto/shared";

interface PublicSellerCardProps {
  seller: IPublicSellerProfile;
  className?: string;
}

const badgeLabels: Record<string, string> = {
  complete: "Profil complet",
  advanced: "Profil avancé",
  intermediate: "Profil intermédiaire",
  new_seller: "Nouveau vendeur",
};

const badgeVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  complete: "default",
  advanced: "secondary",
  intermediate: "outline",
  new_seller: "outline",
};

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return "Nouveau membre";
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Membre depuis ${months} mois`;
  }
  const years = Math.floor(diffDays / 365);
  return `Membre depuis ${years} an${years > 1 ? "s" : ""}`;
}

export function PublicSellerCard({ seller, className }: PublicSellerCardProps) {
  if (seller.isAnonymized) {
    return (
      <Card className={cn("p-4", className)}>
        <p className="text-sm text-muted-foreground">Utilisateur anonymisé</p>
      </Card>
    );
  }

  const initials = seller.displayName ? seller.displayName.substring(0, 2).toUpperCase() : "??";

  return (
    <Card className={cn("p-4", className)}>
      <Link href={`/sellers/${seller.userId}`} className="block space-y-3 hover:opacity-90">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage src={seller.avatarUrl || undefined} alt={seller.displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{seller.displayName}</p>
            <p className="text-xs text-muted-foreground">{formatMemberSince(seller.memberSince)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating rating={seller.rating} size="sm" />
          <span className="text-sm text-muted-foreground">({(seller.rating ?? 0).toFixed(1)})</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={badgeVariants[seller.profileCompletionBadge] || "outline"}>
            {badgeLabels[seller.profileCompletionBadge] || seller.profileCompletionBadge}
          </Badge>
          {seller.totalListings > 0 && (
            <span className="text-xs text-muted-foreground">
              {seller.totalListings} annonce{seller.totalListings > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </Link>
    </Card>
  );
}
