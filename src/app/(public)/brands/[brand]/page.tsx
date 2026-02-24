import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";

interface Props {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = decodeURIComponent((await params).brand);

  const seo = await getSeoMeta("brand_page", { brand, count: "0" });

  if (!seo) {
    return { title: `${brand} occasion | Auto` };
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

export default async function BrandPage({ params }: Props) {
  const brand = decodeURIComponent((await params).brand);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl mb-4">{brand} occasion</h1>
      <p className="text-sm sm:text-base text-muted-foreground">Page en construction (Epic 4)</p>
    </div>
  );
}
