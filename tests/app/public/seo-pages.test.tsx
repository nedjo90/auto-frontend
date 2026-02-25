import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock getSeoMeta
vi.mock("@/lib/seo/get-seo-meta", () => ({
  getSeoMeta: vi.fn().mockResolvedValue(null),
  getSampleData: vi.fn().mockReturnValue({}),
  renderSeoTemplate: vi.fn((t: string) => t),
}));

// Mock structured data
vi.mock("@/lib/seo/structured-data", () => ({
  generateListingJsonLd: vi.fn().mockReturnValue("{}"),
  generateVehicleSchema: vi.fn().mockReturnValue({}),
  generateOfferSchema: vi.fn().mockReturnValue({}),
  generateProductSchema: vi.fn().mockReturnValue({}),
}));

// Mock catalog-api for SearchPage
vi.mock("@/lib/api/catalog-api", () => ({
  getListings: vi.fn().mockResolvedValue({ items: [], total: 0, skip: 0, top: 20, hasMore: false }),
  getCardConfig: vi.fn().mockResolvedValue([]),
  getListingDetail: vi.fn().mockResolvedValue(null),
  getListingSeoData: vi.fn().mockResolvedValue(null),
  getListingSlugs: vi.fn().mockResolvedValue({ slugs: [], total: 0, hasMore: false }),
  formatPrice: vi.fn((p: number | null) => (p != null ? `${p} €` : null)),
  formatMileage: vi.fn((m: number | null) => (m != null ? `${m} km` : null)),
  buildImageUrl: vi.fn((url: string | null) => url || "/placeholder-car.svg"),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

// Mock next/navigation
const mockRedirect = vi.fn();
const mockPermanentRedirect = vi.fn();
const mockNotFound = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error("NEXT_REDIRECT");
  },
  permanentRedirect: (...args: unknown[]) => {
    mockPermanentRedirect(...args);
    throw new Error("NEXT_REDIRECT");
  },
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  constructor() {}
}
vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

describe("SEO Public Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("BrandPage", () => {
    it("renders brand page with brand name", async () => {
      const { default: BrandPage } = await import("@/app/(public)/brands/[brand]/page");
      const page = await BrandPage({ params: Promise.resolve({ brand: "Renault" }) });
      render(page);

      expect(screen.getByText(/Renault occasion/)).toBeDefined();
    });
  });

  describe("ModelPage", () => {
    it("renders model page with brand and model", async () => {
      const { default: ModelPage } = await import("@/app/(public)/brands/[brand]/[model]/page");
      const page = await ModelPage({
        params: Promise.resolve({ brand: "Renault", model: "Clio" }),
      });
      render(page);

      expect(screen.getByText(/Renault Clio occasion/)).toBeDefined();
    });
  });

  describe("CityPage", () => {
    it("renders city page with city name", async () => {
      const { default: CityPage } = await import("@/app/(public)/cities/[city]/page");
      const page = await CityPage({ params: Promise.resolve({ city: "Paris" }) });
      render(page);

      expect(screen.getByText(/Paris/)).toBeDefined();
    });
  });

  describe("SearchPage", () => {
    it("renders search page with query", async () => {
      const { default: SearchPage } = await import("@/app/(public)/search/page");
      const page = await SearchPage({
        searchParams: Promise.resolve({ q: "Renault" }),
      });
      render(page);

      expect(screen.getByText(/Renault/)).toBeDefined();
    });

    it("renders search page without query", async () => {
      const { default: SearchPage } = await import("@/app/(public)/search/page");
      const page = await SearchPage({
        searchParams: Promise.resolve({}),
      });
      render(page);

      expect(screen.getByText(/Toutes les annonces/)).toBeDefined();
    });
  });

  describe("ListingDetailPage (legacy /listings/[id])", () => {
    it("redirects to new slug URL when listing is found", async () => {
      const { getListingDetail } = await import("@/lib/api/catalog-api");
      (getListingDetail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        make: "Peugeot",
        model: "3008",
        year: 2022,
      });

      const { default: LegacyPage } = await import("@/app/(public)/listings/[id]/page");

      await expect(
        LegacyPage({ params: Promise.resolve({ id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }) }),
      ).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPermanentRedirect).toHaveBeenCalledWith(
        expect.stringContaining("/listing/peugeot-3008-2022-"),
      );
    });

    it("returns 404 when listing not found", async () => {
      const { getListingDetail } = await import("@/lib/api/catalog-api");
      (getListingDetail as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const { default: LegacyPage } = await import("@/app/(public)/listings/[id]/page");

      await expect(LegacyPage({ params: Promise.resolve({ id: "nonexistent" }) })).rejects.toThrow(
        "NEXT_NOT_FOUND",
      );
    });
  });

  describe("ListingDetailPage (new /listing/[slug])", () => {
    it("renders listing page when listing found with matching slug", async () => {
      const { getListingDetail, getListingSeoData } = await import("@/lib/api/catalog-api");
      (getListingDetail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        make: "Peugeot",
        model: "3008",
        year: 2022,
        status: "published",
      });
      (getListingSeoData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        slug: "peugeot-3008-2022-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        metaTitle: "Peugeot 3008 2022 | Auto",
        structuredData: JSON.stringify({ "@context": "https://schema.org" }),
      });

      const { default: SlugPage } = await import("@/app/(public)/listing/[slug]/page");
      const page = await SlugPage({
        params: Promise.resolve({
          slug: "peugeot-3008-2022-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        }),
      });
      const { container } = render(page);

      // Should render the listing detail client (shows loading spinner)
      expect(container.querySelector("[data-testid='listing-detail-loading']")).toBeDefined();
    });

    it("includes JSON-LD script tag when SEO data available", async () => {
      const { getListingDetail, getListingSeoData } = await import("@/lib/api/catalog-api");
      (getListingDetail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        make: "Peugeot",
        model: "3008",
        year: 2022,
      });
      (getListingSeoData as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        structuredData: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [],
        }),
      });

      const { default: SlugPage } = await import("@/app/(public)/listing/[slug]/page");
      const page = await SlugPage({
        params: Promise.resolve({
          slug: "peugeot-3008-2022-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        }),
      });
      const { container } = render(page);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
    });

    it("returns 404 for invalid slug (no ID extractable)", async () => {
      const { default: SlugPage } = await import("@/app/(public)/listing/[slug]/page");

      await expect(SlugPage({ params: Promise.resolve({ slug: "" }) })).rejects.toThrow(
        "NEXT_NOT_FOUND",
      );
    });

    it("returns 404 when listing not found", async () => {
      const { getListingDetail } = await import("@/lib/api/catalog-api");
      (getListingDetail as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const { default: SlugPage } = await import("@/app/(public)/listing/[slug]/page");

      await expect(
        SlugPage({
          params: Promise.resolve({
            slug: "fake-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          }),
        }),
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("redirects to canonical slug when URL slug is stale", async () => {
      const { getListingDetail, getListingSeoData } = await import("@/lib/api/catalog-api");
      (getListingDetail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        make: "Peugeot",
        model: "3008",
        year: 2023, // year changed from 2022 to 2023
      });
      (getListingSeoData as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const { default: SlugPage } = await import("@/app/(public)/listing/[slug]/page");

      await expect(
        SlugPage({
          params: Promise.resolve({
            slug: "peugeot-3008-2022-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          }),
        }),
      ).rejects.toThrow("NEXT_REDIRECT");

      expect(mockPermanentRedirect).toHaveBeenCalledWith(
        expect.stringContaining("peugeot-3008-2023"),
      );
    });
  });
});
