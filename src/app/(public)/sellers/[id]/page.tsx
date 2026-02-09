"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import type { IPublicSellerProfile } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const badgeLabels: Record<string, string> = {
  complete: "Profil complet",
  advanced: "Profil avancé",
  intermediate: "Profil intermédiaire",
  new_seller: "Nouveau vendeur",
};

export default function SellerPublicPage() {
  const params = useParams();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<IPublicSellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeller() {
      try {
        const res = await fetch(
          `${API_BASE}/api/profile/getPublicSellerProfile(sellerId=${sellerId})`,
        );
        if (!res.ok) {
          throw new Error("Vendeur non trouvé");
        }
        const data = await res.json();
        setSeller(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    if (sellerId) fetchSeller();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12" role="status">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive" role="alert">
        {error || "Vendeur non trouvé"}
      </div>
    );
  }

  if (seller.isAnonymized) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Utilisateur anonymisé</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les informations de ce vendeur ne sont plus disponibles.
          </p>
        </Card>
      </div>
    );
  }

  const initials = seller.displayName ? seller.displayName.substring(0, 2).toUpperCase() : "??";

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={seller.avatarUrl || undefined} alt={seller.displayName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{seller.displayName}</h1>
            <p className="text-sm text-muted-foreground">
              Membre depuis{" "}
              {new Date(seller.memberSince).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {seller.bio && <p className="mt-4 text-sm text-muted-foreground">{seller.bio}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <StarRating rating={seller.rating} size="md" />
            <span className="text-sm font-medium">{seller.rating.toFixed(1)}</span>
          </div>
          <Badge>
            {badgeLabels[seller.profileCompletionBadge] || seller.profileCompletionBadge}
          </Badge>
          {seller.totalListings > 0 && (
            <span className="text-sm text-muted-foreground">
              {seller.totalListings} annonce{seller.totalListings > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
