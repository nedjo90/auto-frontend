import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";
import { getListings, getCardConfig } from "@/lib/api/catalog-api";
import { ListingGrid } from "@/components/search/listing-grid";
import { ListingCardSkeletonGrid } from "@/components/listing/listing-card-skeleton";
import { Suspense } from "react";

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

async function SearchResults({ search }: { search: string }) {
  let page;
  let cardConfig;

  try {
    [page, cardConfig] = await Promise.all([
      getListings({ skip: 0, top: 20, search }),
      getCardConfig(),
    ]);
  } catch {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Erreur lors du chargement des annonces. Veuillez réessayer.
        </p>
      </div>
    );
  }

  return (
    <ListingGrid
      initialItems={page.items}
      initialTotal={page.total}
      cardConfig={cardConfig}
      search={search}
    />
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const search = q || "";

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl mb-4 sm:mb-6">
        {search ? `Résultats pour "${search}"` : "Toutes les annonces"}
      </h1>

      <Suspense fallback={<ListingCardSkeletonGrid count={6} />}>
        <SearchResults search={search} />
      </Suspense>
    </div>
  );
}
