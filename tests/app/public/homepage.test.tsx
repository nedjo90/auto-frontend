import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(public)/page";

// Mock all home components
vi.mock("@/components/home/hero-section", () => ({
  HeroSection: () => <div data-testid="hero-section">HeroSection</div>,
}));
vi.mock("@/components/home/trust-strip", () => ({
  TrustStrip: () => <div data-testid="trust-strip">TrustStrip</div>,
}));
vi.mock("@/components/home/featured-listings", () => ({
  FeaturedListings: () => <div data-testid="featured-listings">FeaturedListings</div>,
  FeaturedListingsSkeleton: () => <div>FeaturedListingsSkeleton</div>,
}));
vi.mock("@/components/home/how-it-works-section", () => ({
  HowItWorksSection: () => <div data-testid="how-it-works">HowItWorksSection</div>,
}));
vi.mock("@/components/home/seller-cta-section", () => ({
  SellerCtaSection: () => <div data-testid="seller-cta-section">SellerCtaSection</div>,
}));
vi.mock("@/components/seo/json-ld", () => ({
  JsonLd: ({ data }: { data: Record<string, unknown> }) => (
    <script data-testid="json-ld" type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  ),
}));

describe("HomePage", () => {
  it("should render all homepage sections", () => {
    render(<HomePage />);

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("trust-strip")).toBeInTheDocument();
    expect(screen.getByTestId("how-it-works")).toBeInTheDocument();
    expect(screen.getByTestId("seller-cta-section")).toBeInTheDocument();
  });

  it("should include JSON-LD structured data", () => {
    render(<HomePage />);

    const jsonLd = screen.getByTestId("json-ld");
    expect(jsonLd).toBeInTheDocument();

    const data = JSON.parse(jsonLd.textContent || "{}");
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBe("Auto");
    expect(data.potentialAction["@type"]).toBe("SearchAction");
  });

  it("should render sections in correct order", () => {
    const { container } = render(<HomePage />);

    const sections = container.querySelectorAll("[data-testid]");
    const testIds = Array.from(sections).map((el) => el.getAttribute("data-testid"));

    expect(testIds).toEqual([
      "json-ld",
      "hero-section",
      "trust-strip",
      "featured-listings",
      "how-it-works",
      "seller-cta-section",
    ]);
  });
});
