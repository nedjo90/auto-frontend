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
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
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

  describe("ListingDetailPage", () => {
    it("renders listing page with id", async () => {
      const { default: ListingDetailPage } = await import("@/app/(public)/listings/[id]/page");
      const page = await ListingDetailPage({
        params: Promise.resolve({ id: "abc-123" }),
      });
      const { container } = render(page);

      // ListingDetailClient renders a loading spinner
      expect(container.querySelector("[data-testid='listing-detail-loading']")).toBeDefined();
    });

    it("includes JSON-LD script tag", async () => {
      const { default: ListingDetailPage } = await import("@/app/(public)/listings/[id]/page");
      const page = await ListingDetailPage({
        params: Promise.resolve({ id: "abc-123" }),
      });
      const { container } = render(page);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).not.toBeNull();
    });
  });
});
