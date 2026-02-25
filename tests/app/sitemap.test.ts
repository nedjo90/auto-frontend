import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/catalog-api", () => ({
  getListingSlugs: vi.fn().mockResolvedValue({
    slugs: [
      { slug: "peugeot-3008-2022-marseille-abc123", lastModified: "2026-02-20T10:00:00Z" },
      { slug: "renault-clio-2021-paris-def456", lastModified: "2026-02-19T10:00:00Z" },
    ],
    total: 2,
    hasMore: false,
  }),
}));

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate sitemap with static and listing pages", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();

    // Static pages
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/"))).toBe(true);
    expect(urls.some((u) => u.includes("/search"))).toBe(true);
    expect(urls.some((u) => u.includes("/how-it-works"))).toBe(true);
    expect(urls.some((u) => u.includes("/about"))).toBe(true);
    expect(urls.some((u) => u.includes("/trust"))).toBe(true);

    // Listing pages
    expect(urls.some((u) => u.includes("/listing/peugeot-3008"))).toBe(true);
    expect(urls.some((u) => u.includes("/listing/renault-clio"))).toBe(true);

    // Total: 5 static + 2 listings
    expect(entries).toHaveLength(7);
  });

  it("should set correct priorities", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();

    const homepage = entries.find((e) => e.url.endsWith("/"));
    expect(homepage?.priority).toBe(1.0);

    const listing = entries.find((e) => e.url.includes("/listing/"));
    expect(listing?.priority).toBe(0.8);

    const search = entries.find((e) => e.url.includes("/search"));
    expect(search?.priority).toBe(0.6);

    const staticPage = entries.find((e) => e.url.includes("/how-it-works"));
    expect(staticPage?.priority).toBe(0.5);
  });

  it("should set correct change frequencies", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();

    const listing = entries.find((e) => e.url.includes("/listing/"));
    expect(listing?.changeFrequency).toBe("daily");

    const staticPage = entries.find((e) => e.url.includes("/about"));
    expect(staticPage?.changeFrequency).toBe("monthly");
  });

  it("should handle empty listing slugs", async () => {
    const { getListingSlugs } = await import("@/lib/api/catalog-api");
    (getListingSlugs as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      slugs: [],
      total: 0,
      hasMore: false,
    });

    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();

    // Only static pages
    expect(entries).toHaveLength(5);
  });
});
