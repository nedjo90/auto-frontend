import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = decodeURIComponent((await params).city);

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
  const city = decodeURIComponent((await params).city);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl mb-4">Annonces à {city}</h1>
      <p className="text-sm sm:text-base text-muted-foreground">Page en construction (Epic 4)</p>
    </div>
  );
}
