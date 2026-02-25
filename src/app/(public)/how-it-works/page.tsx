import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";
import { ShieldCheck, Search, Car, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("landing_page", { title: "Comment ca marche" });

  return {
    title: seo?.metaTitle || "Comment ca marche | Auto",
    description:
      seo?.metaDescription ||
      "Decouvrez comment acheter ou vendre un vehicule d'occasion certifie sur Auto.",
    openGraph: {
      title: seo?.ogTitle || "Comment ca marche | Auto",
      description: seo?.ogDescription || "",
    },
    alternates: { canonical: "/how-it-works" },
  };
}

const steps = [
  {
    icon: Search,
    title: "Recherchez",
    description:
      "Parcourez des milliers d'annonces certifiees avec nos filtres avances : marque, modele, budget, localisation.",
  },
  {
    icon: ShieldCheck,
    title: "Verifiez",
    description:
      "Chaque annonce affiche un score de certification. Les donnees sont verifiees automatiquement via des sources officielles.",
  },
  {
    icon: Car,
    title: "Contactez",
    description:
      "Entrez en contact directement avec le vendeur via notre messagerie securisee. Posez vos questions en toute confiance.",
  },
  {
    icon: CreditCard,
    title: "Achetez",
    description:
      "Finalisez votre achat en toute securite. Nos annonces certifiees vous garantissent transparence et fiabilite.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl mb-4">Comment ca marche</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Auto simplifie l&apos;achat et la vente de vehicules d&apos;occasion grace a la
        certification automatique des donnees vehicule.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.title} data-testid={`step-${index + 1}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Etape {index + 1}</span>
              </div>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
