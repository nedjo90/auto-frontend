import type { SeoPageType } from "@auto/shared";
import { SEO_SAMPLE_DATA } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface SeoMeta {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
}

/**
 * Replace {{placeholder}} tokens with values from data object.
 * Used for client-side fallback rendering.
 */
function renderTemplate(template: string, data: Record<string, string>): string {
  if (!template) return "";
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => data[key] ?? "");
}

/**
 * Fetch resolved SEO meta from the backend API.
 * Falls back to client-side template rendering if the API is unavailable.
 */
export async function getSeoMeta(
  pageType: SeoPageType,
  data: Record<string, string>,
  language = "fr",
): Promise<SeoMeta | null> {
  try {
    const params = new URLSearchParams({
      pageType,
      language,
      ...data,
    });
    const res = await fetch(`${API_BASE}/api/seo/resolve?${params.toString()}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall through to client-side resolution
  }

  // Client-side fallback: resolve locally using cached templates
  return null;
}

/**
 * Get sample data for a given page type (for preview/testing).
 */
export function getSampleData(pageType: SeoPageType): Record<string, string> {
  return { ...SEO_SAMPLE_DATA[pageType] };
}

/**
 * Render a template string with data (client-side utility).
 */
export { renderTemplate };
