import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";
import { ShieldCheck, Lock, FileCheck, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("landing_page", { title: "Confiance et securite" });

  return {
    title: seo?.metaTitle || "Confiance et securite | Auto",
    description:
      seo?.metaDescription ||
      "Decouvrez les mesures de securite et de confiance mises en place par Auto pour proteger acheteurs et vendeurs.",
    openGraph: {
      title: seo?.ogTitle || "Confiance et securite | Auto",
      description: seo?.ogDescription || "",
    },
    alternates: { canonical: "/trust" },
  };
}

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Certification automatique",
    description:
      "Les donnees vehicule sont verifiees automatiquement via des sources officielles (SIV, ANTS, controle technique).",
  },
  {
    icon: FileCheck,
    title: "Declaration sur l'honneur",
    description:
      "Chaque vendeur signe une declaration sur l'honneur attestant l'exactitude des informations declarees.",
  },
  {
    icon: Lock,
    title: "Donnees protegees",
    description:
      "Vos donnees personnelles sont protegees conformement au RGPD. Vous pouvez exercer vos droits a tout moment.",
  },
  {
    icon: Eye,
    title: "Score de visibilite",
    description:
      "Chaque annonce affiche un score de documentation transparent : plus les donnees sont verifiees, plus l'annonce est visible.",
  },
];

export default function TrustPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl mb-4">Confiance &amp; Securite</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Auto met en oeuvre des mesures rigoureuses pour garantir la fiabilite des annonces et la
        securite des transactions.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {trustFeatures.map((feature) => (
          <Card
            key={feature.title}
            data-testid={`trust-feature-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
