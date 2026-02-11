import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;

  const seo = await getSeoMeta("city_page", { city, count: "0" });

  if (!seo) {
    return { title: `Annonces ${city} | Auto` };
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

export default async function CityPage({ params }: Props) {
  const { city } = await params;

  return (
    <div>
      <p>Annonces à {city} - Page en construction (Epic 4)</p>
    </div>
  );
}
