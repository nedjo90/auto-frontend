import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { extractIdFromSlug, generateListingSlug } from "@auto/shared";
import { getListingDetail, getListingSeoData } from "@/lib/api/catalog-api";
import { JsonLd } from "@/components/seo/json-ld";
import { ListingDetailClient } from "./listing-detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listingId = extractIdFromSlug(slug);

  if (!listingId) {
    return { title: "Annonce introuvable | Auto" };
  }

  const seoData = await getListingSeoData(listingId);

  if (!seoData) {
    return { title: "Annonce | Auto" };
  }

  return {
    title: seoData.metaTitle,
    description: seoData.metaDescription,
    openGraph: {
      title: seoData.ogTitle || seoData.metaTitle,
      description: seoData.ogDescription || seoData.metaDescription,
      images: seoData.ogImage ? [{ url: seoData.ogImage }] : undefined,
      url: seoData.canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.ogTitle || seoData.metaTitle,
      description: seoData.ogDescription || seoData.metaDescription,
      images: seoData.ogImage ? [seoData.ogImage] : undefined,
    },
    alternates: {
      canonical: seoData.canonicalUrl,
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listingId = extractIdFromSlug(slug);

  if (!listingId) {
    notFound();
  }

  // Fetch listing to validate slug and get data
  const listing = await getListingDetail(listingId);

  if (!listing) {
    notFound();
  }

  // Generate the canonical slug and redirect if URL slug is stale
  const canonicalSlug = generateListingSlug({
    ID: listing.ID,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    city: null, // city not in IPublicListingDetail, slug works without it
  });

  if (slug !== canonicalSlug && canonicalSlug !== listingId) {
    redirect(`/listing/${canonicalSlug}`);
  }

  // Fetch SEO data for structured data
  const seoData = await getListingSeoData(listingId);
  const structuredData = seoData?.structuredData ? JSON.parse(seoData.structuredData) : null;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {structuredData && <JsonLd data={structuredData} />}
      <ListingDetailClient listingId={listingId} />
    </div>
  );
}
