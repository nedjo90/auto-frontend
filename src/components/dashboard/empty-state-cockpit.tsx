"use client";

import Link from "next/link";
import { Car, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Empty state for the seller cockpit when no listings exist.
 * Shows a welcoming message with CTAs to create first listing or explore marketplace.
 */
export function EmptyStateCockpit() {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 sm:py-16"
      data-testid="empty-state-cockpit"
    >
      <Card className="w-full max-w-lg border-dashed">
        <CardContent className="flex flex-col items-center text-center p-6 sm:p-10 space-y-5">
          <div className="rounded-full bg-primary/10 p-4">
            <Car className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold sm:text-2xl flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Bienvenue dans votre espace vendeur !
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base max-w-md">
              Suivez vos performances, positionnez-vous sur le marché et gérez vos conversations,
              tout au même endroit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
            <Button asChild size="lg" data-testid="cta-create-listing">
              <Link href="/seller/drafts">
                <Car className="mr-2 h-4 w-4" />
                Publiez votre premier véhicule
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" data-testid="cta-explore-market">
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Explorez le marché
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
