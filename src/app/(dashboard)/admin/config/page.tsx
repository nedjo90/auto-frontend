"use client";

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CONFIG_SECTIONS = [
  {
    href: "/admin/config/pricing",
    title: "Tarification",
    description: "Prix des annonces, frais de boost, commissions.",
  },
  {
    href: "/admin/config/texts",
    title: "Textes",
    description: "Textes d'interface par langue (i18n).",
  },
  {
    href: "/admin/config/features",
    title: "Fonctionnalites",
    description: "Activer ou desactiver les fonctionnalites de la plateforme.",
  },
  {
    href: "/admin/config/registration",
    title: "Inscription",
    description: "Champs du formulaire d'inscription et leurs regles.",
  },
  {
    href: "/admin/config/card-display",
    title: "Affichage carte",
    description: "Configuration des champs affiches sur les cartes d'annonces.",
  },
  {
    href: "/admin/config/providers",
    title: "Fournisseurs API",
    description: "Gestion des fournisseurs API externes et basculement a chaud.",
  },
  {
    href: "/admin/config/costs",
    title: "Couts API",
    description: "Suivi des couts API, marge par annonce et repartition par fournisseur.",
  },
] as const;

export default function ConfigOverviewPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CONFIG_SECTIONS.map((section) => (
        <Link key={section.href} href={section.href} className="block">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
