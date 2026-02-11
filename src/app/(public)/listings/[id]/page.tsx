import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";
import { generateListingJsonLd } from "@/lib/seo/structured-data";
import type { ListingData } from "@/lib/seo/structured-data";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  // TODO: Fetch actual listing data from backend when Listing entity exists (Epic 3)
  const seo = await getSeoMeta("listing_detail", {
    id,
    brand: "",
    model: "",
    year: "",
    price: "",
    city: "",
  });

  if (!seo) {
    return { title: "Annonce | Auto" };
  }

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    openGraph: {
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
    },
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;

  // TODO: Fetch listing data and render page (Epic 3)
  // Stub JSON-LD for structured data integration
  const stubListing: ListingData = {
    id,
    title: "Annonce",
    description: "",
    url: `/listings/${id}`,
    images: [],
    vehicle: { make: "", model: "", year: 0 },
    offer: { price: 0 },
  };

  const jsonLd = generateListingJsonLd(stubListing);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <p>Annonce {id} - Page en construction (Epic 3)</p>
    </div>
  );
}
