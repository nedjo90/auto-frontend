import { Suspense } from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { TrustStrip } from "@/components/home/trust-strip";
import { FeaturedListings, FeaturedListingsSkeleton } from "@/components/home/featured-listings";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { SellerCtaSection } from "@/components/home/seller-cta-section";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Auto — Annonces vehicules verifiees | Donnees certifiees & transparence",
  description:
    "Trouvez votre prochain vehicule en toute confiance. Annonces verifiees, donnees certifiees, historique transparent. Voitures et motos d'occasion sur Auto.",
  openGraph: {
    title: "Auto — Annonces vehicules verifiees",
    description:
      "Trouvez votre prochain vehicule en toute confiance. Annonces verifiees, donnees certifiees, historique transparent.",
    type: "website",
    siteName: "Auto",
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto — Annonces vehicules verifiees",
    description:
      "Trouvez votre prochain vehicule en toute confiance. Annonces verifiees, donnees certifiees, historique transparent.",
  },
};

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Auto",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://auto.fr",
  description:
    "Plateforme d'annonces vehicules verifiees avec donnees certifiees et transparence totale.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://auto.fr"}/search?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={WEBSITE_JSONLD} />
      <HeroSection />
      <TrustStrip />
      <Suspense fallback={<FeaturedListingsSkeleton />}>
        <FeaturedListings />
      </Suspense>
      <HowItWorksSection />
      <SellerCtaSection />
    </>
  );
}
