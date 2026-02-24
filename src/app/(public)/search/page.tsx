import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q || "";

  const seo = await getSeoMeta("search_results", { query, count: "0", city: "", brand: "" });

  if (!seo) {
    return { title: `${query || "Recherche"} | Auto` };
  }

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    openGraph: {
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
    },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl mb-4">Recherche</h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Recherche : {q || "toutes les annonces"} - Page en construction (Epic 3)
      </p>
    </div>
  );
}
