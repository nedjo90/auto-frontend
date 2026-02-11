import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock getSeoMeta
vi.mock("@/lib/seo/get-seo-meta", () => ({
  getSeoMeta: vi.fn().mockResolvedValue(null),
  getSampleData: vi.fn().mockReturnValue({}),
  renderTemplate: vi.fn((t: string) => t),
}));

// Mock structured data
vi.mock("@/lib/seo/structured-data", () => ({
  generateListingJsonLd: vi.fn().mockReturnValue("{}"),
  generateVehicleSchema: vi.fn().mockReturnValue({}),
  generateOfferSchema: vi.fn().mockReturnValue({}),
  generateProductSchema: vi.fn().mockReturnValue({}),
}));

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

      expect(screen.getByText(/toutes les annonces/)).toBeDefined();
    });
  });

  describe("ListingDetailPage", () => {
    it("renders listing page with id", async () => {
      const { default: ListingDetailPage } = await import("@/app/(public)/listings/[id]/page");
      const page = await ListingDetailPage({
        params: Promise.resolve({ id: "abc-123" }),
      });
      render(page);

      expect(screen.getByText(/abc-123/)).toBeDefined();
    });

    it("includes JSON-LD script tag", async () => {
      const { default: ListingDetailPage } = await import("@/app/(public)/listings/[id]/page");
      const page = await ListingDetailPage({
        params: Promise.resolve({ id: "abc-123" }),
      });
      const { container } = render(page);

      const script = container.querySelector('script[type="application/ld+json"]');
      expect(script).toBeDefined();
    });
  });
});
