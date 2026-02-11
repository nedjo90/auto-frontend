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
    <div>
      <p>Recherche : {q || "toutes les annonces"} - Page en construction (Epic 3)</p>
    </div>
  );
}
