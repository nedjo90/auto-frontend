import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";

interface Props {
  params: Promise<{ brand: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params;

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
  const { brand } = await params;

  return (
    <div>
      <p>{brand} occasion - Page en construction (Epic 4)</p>
    </div>
  );
}
