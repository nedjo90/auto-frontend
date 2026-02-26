"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Zap, Eye, Users } from "lucide-react";

const BENEFITS = [
  {
    icon: Zap,
    text: "Remplissage automatique en 3 secondes",
    testId: "benefit-autofill",
  },
  {
    icon: Eye,
    text: "Score de visibilité en temps réel",
    testId: "benefit-visibility",
  },
  {
    icon: Users,
    text: "Audience qualifiée d'acheteurs vérifiés",
    testId: "benefit-audience",
  },
] as const;

/**
 * Seller CTA section with benefits and auth-aware publish button.
 */
export function SellerCtaSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const ctaHref = isAuthenticated ? "/seller/publish" : "/register";

  return (
    <section className="px-4 py-10 sm:px-6 sm:py-14 lg:py-16" data-testid="seller-cta-section">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-lg font-bold sm:text-xl lg:text-2xl">{"Vendez votre véhicule"}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {"Publiez votre annonce en quelques minutes et touchez des milliers d'acheteurs"}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.testId}
              className="flex flex-col items-center gap-2 rounded-lg border p-4"
              data-testid={benefit.testId}
            >
              <benefit.icon className="size-6 text-primary" />
              <span className="text-sm font-medium">{benefit.text}</span>
            </div>
          ))}
        </div>

        <Button
          size="lg"
          className="mt-8"
          onClick={() => router.push(ctaHref)}
          data-testid="seller-cta-button"
        >
          Publier une annonce
        </Button>
      </div>
    </section>
  );
}
