import type { Metadata } from "next";
import { getSeoMeta } from "@/lib/seo/get-seo-meta";

interface Props {
  params: Promise<{ brand: string; model: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: rawBrand, model: rawModel } = await params;
  const brand = decodeURIComponent(rawBrand);
  const model = decodeURIComponent(rawModel);

  const seo = await getSeoMeta("model_page", { brand, model, count: "0" });

  if (!seo) {
    return { title: `${brand} ${model} occasion | Auto` };
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

export default async function ModelPage({ params }: Props) {
  const { brand: rawBrand, model: rawModel } = await params;
  const brand = decodeURIComponent(rawBrand);
  const model = decodeURIComponent(rawModel);

  return (
    <div>
      <p>
        {brand} {model} occasion - Page en construction (Epic 4)
      </p>
    </div>
  );
}
