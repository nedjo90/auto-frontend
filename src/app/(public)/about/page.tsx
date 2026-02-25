import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("landing_page", { title: "A propos" });

  return {
    title: seo?.metaTitle || "A propos | Auto",
    description:
      seo?.metaDescription ||
      "Auto est la plateforme de confiance pour l'achat et la vente de vehicules d'occasion certifies.",
    openGraph: {
      title: seo?.ogTitle || "A propos | Auto",
      description: seo?.ogDescription || "",
    },
    alternates: { canonical: "/about" },
  };
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl mb-4">A propos d&apos;Auto</h1>

      <div className="prose prose-sm sm:prose max-w-3xl">
        <p className="text-muted-foreground text-lg">
          Auto est une plateforme innovante dediee a l&apos;achat et la vente de vehicules
          d&apos;occasion en France.
        </p>

        <section className="mt-8" data-testid="about-mission">
          <h2 className="text-xl font-semibold sm:text-2xl mb-3">Notre mission</h2>
          <p className="text-muted-foreground">
            Nous croyons que l&apos;achat d&apos;un vehicule d&apos;occasion doit etre transparent,
            securise et simple. Grace a notre systeme de certification automatique, chaque annonce
            affiche un niveau de documentation verifie, vous permettant de prendre des decisions
            eclairees.
          </p>
        </section>

        <section className="mt-8" data-testid="about-values">
          <h2 className="text-xl font-semibold sm:text-2xl mb-3">Nos valeurs</h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-5">
            <li>
              <strong>Transparence</strong> : Toutes les donnees vehicule sont verifiees et
              clairement presentees.
            </li>
            <li>
              <strong>Securite</strong> : Messagerie securisee et paiement protege.
            </li>
            <li>
              <strong>Simplicite</strong> : Interface intuitive pour publier et trouver des
              annonces.
            </li>
            <li>
              <strong>Confiance</strong> : Systeme de certification et declaration sur
              l&apos;honneur.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
