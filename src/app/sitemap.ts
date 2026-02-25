import type { MetadataRoute } from "next";
import { getListingSlugs } from "@/lib/api/catalog-api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://auto-platform.fr";

/**
 * Generate sitemap for all public pages.
 * Handles pagination for large listing counts (sitemap protocol limit: 50,000 URLs).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  entries.push(
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/trust`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  );

  // Fetch all published listing slugs with pagination
  let skip = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore && entries.length < 50000) {
    try {
      const result = await getListingSlugs(skip, batchSize);

      for (const item of result.slugs) {
        entries.push({
          url: `${SITE_URL}/listing/${item.slug}`,
          lastModified: new Date(item.lastModified),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }

      hasMore = result.hasMore;
      skip += batchSize;
    } catch {
      break;
    }
  }

  return entries;
}
