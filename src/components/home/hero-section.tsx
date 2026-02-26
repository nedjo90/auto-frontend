"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { Search } from "lucide-react";

/**
 * Homepage hero section with Lora display title, value proposition subtitle,
 * quick search form, and dual CTAs.
 */
export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (make) params.set("make", make);
      if (model) params.set("model", model);
      if (city) params.set("search", city);
      if (maxPrice) params.set("maxPrice", maxPrice);
      router.push(`/search?${params.toString()}`);
    },
    [make, model, city, maxPrice, router],
  );

  const sellerCTAHref = isAuthenticated ? "/seller/publish" : "/register";

  return (
    <section
      className="bg-gradient-to-b from-muted/50 to-background px-4 py-12 sm:px-6 sm:py-16 lg:py-24"
      data-testid="hero-section"
    >
      <div className="mx-auto max-w-4xl text-center">
        {/* Title */}
        <h1
          className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          data-testid="hero-title"
        >
          Trouvez votre prochain vehicule en toute confiance
        </h1>

        {/* Subtitle */}
        <p
          className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg"
          data-testid="hero-subtitle"
        >
          Annonces verifiees. Donnees certifiees. Transparence totale.
        </p>

        {/* Quick search form */}
        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 max-w-3xl sm:mt-10"
          data-testid="hero-search-form"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              type="text"
              placeholder="Marque"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="h-11"
              data-testid="hero-search-make"
            />
            <Input
              type="text"
              placeholder="Modele"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="h-11"
              data-testid="hero-search-model"
            />
            <Input
              type="text"
              placeholder="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-11"
              data-testid="hero-search-city"
            />
            <Input
              type="number"
              placeholder="Budget max (€)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-11"
              data-testid="hero-search-budget"
              min={0}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-4 w-full gap-2 sm:w-auto"
            data-testid="hero-search-submit"
          >
            <Search className="size-4" />
            Rechercher un vehicule
          </Button>
        </form>

        {/* Dual CTAs */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(sellerCTAHref)}
            data-testid="hero-seller-cta"
          >
            Vendre mon vehicule
          </Button>
        </div>
      </div>
    </section>
  );
}
