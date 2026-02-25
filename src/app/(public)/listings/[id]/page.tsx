import { permanentRedirect, notFound } from "next/navigation";
import { generateListingSlug } from "@auto/shared";
import { getListingDetail } from "@/lib/api/catalog-api";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Legacy route: /listings/[id]
 * Permanently redirects to the new semantic URL: /listing/[slug]
 */
export default async function LegacyListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListingDetail(id);

  if (!listing) {
    notFound();
  }

  const slug = generateListingSlug({
    ID: listing.ID,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    city: listing.city,
  });

  permanentRedirect(`/listing/${slug}`);
}
