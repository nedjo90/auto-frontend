import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://auto-platform.fr";

/**
 * Generate robots.txt for search engine crawlers.
 * Allows public pages, disallows authenticated routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/favorites", "/dashboard", "/api/", "/settings", "/profile", "/seller/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
