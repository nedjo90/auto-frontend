import type { Metadata } from "next";
import { Suspense } from "react";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";
import { getListings, getCardConfig } from "@/lib/api/catalog-api";
import { SearchResults } from "@/components/search/search-results";
import { ListingCardSkeletonGrid } from "@/components/listing/listing-card-skeleton";
import { parseSearchParams } from "@/lib/search-params";
import type { ISearchFilters } from "@auto/shared";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const raw = await searchParams;
  const query = (typeof raw.q === "string" ? raw.q : "") || "";

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

/** Build ISearchFilters from raw searchParams. */
function buildFilters(raw: Record<string, string | string[] | undefined>): ISearchFilters {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(raw)) {
    if (val === undefined) continue;
    if (Array.isArray(val)) {
      val.forEach((v) => params.append(key, v));
    } else {
      params.set(key, val);
    }
  }
  return parseSearchParams(params);
}

async function SearchContent({ filters }: { filters: ISearchFilters }) {
  let page;
  let cardConfig;

  try {
    [page, cardConfig] = await Promise.all([
      getListings({ skip: 0, top: 20, filters }),
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
    <SearchResults
      initialItems={page.items}
      initialTotal={page.total}
      cardConfig={cardConfig}
      initialFilters={filters}
    />
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const raw = await searchParams;
  const filters = buildFilters(raw);
  const search = filters.search || "";

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl mb-4 sm:mb-6">
        {search ? `Résultats pour "${search}"` : "Toutes les annonces"}
      </h1>

      <Suspense fallback={<ListingCardSkeletonGrid count={6} />}>
        <SearchContent filters={filters} />
      </Suspense>
    </div>
  );
}
