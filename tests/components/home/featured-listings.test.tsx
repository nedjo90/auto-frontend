import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturedListings, FeaturedListingsSkeleton } from "@/components/home/featured-listings";
import type { IPublicListingCard, IConfigListingCard } from "@auto/shared";

// Mock next/image
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockGetListings = vi.fn();
const mockGetCardConfig = vi.fn();

vi.mock("@/lib/api/catalog-api", () => ({
  getListings: (...args: unknown[]) => mockGetListings(...args),
  getCardConfig: (...args: unknown[]) => mockGetCardConfig(...args),
  formatPrice: (price: number | null) =>
    price != null
      ? new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(price)
      : null,
  formatMileage: (m: number | null) =>
    m != null ? `${new Intl.NumberFormat("fr-FR").format(m)} km` : null,
  buildImageUrl: (url: string | null) => url || "/placeholder-car.svg",
}));

const baseListing: IPublicListingCard = {
  ID: "listing-1",
  slug: "peugeot-308-2022-paris",
  make: "Peugeot",
  model: "308",
  variant: null,
  year: 2022,
  price: 18000,
  mileage: 30000,
  fuelType: "Essence",
  gearbox: "Automatique",
  bodyType: "Berline",
  color: "Gris",
  condition: "Bon",
  visibilityScore: 85,
  visibilityLabel: "Bien documente",
  publishedAt: "2026-02-01T00:00:00Z",
  primaryPhotoUrl: "https://cdn.example.com/photo.jpg",
  photoCount: 3,
  certifiedFieldCount: 12,
  totalFieldCount: 15,
  sellerId: "seller-1",
  certificationLevel: "bien_documente",
  ctValid: true,
  marketComparison: { position: "aligned", percentageDiff: 0, displayText: "Prix aligne" },
};

const defaultConfig: IConfigListingCard[] = [
  {
    ID: "1",
    fieldName: "price",
    displayOrder: 1,
    isVisible: true,
    labelFr: "Prix",
    labelEn: "Price",
    fieldType: "price",
  },
  {
    ID: "2",
    fieldName: "year",
    displayOrder: 2,
    isVisible: true,
    labelFr: "Annee",
    labelEn: "Year",
    fieldType: "text",
  },
];

describe("FeaturedListings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render listings when data exists", async () => {
    mockGetListings.mockResolvedValue({
      items: [baseListing, { ...baseListing, ID: "listing-2", slug: "renault-clio" }],
      total: 2,
      skip: 0,
      top: 8,
      hasMore: false,
    });
    mockGetCardConfig.mockResolvedValue(defaultConfig);

    const el = await FeaturedListings();
    render(el);

    expect(screen.getByTestId("featured-listings")).toBeInTheDocument();
    expect(screen.getByTestId("featured-listings-grid")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-listing-1")).toBeInTheDocument();
    expect(screen.getByTestId("listing-card-listing-2")).toBeInTheDocument();
  });

  it("should render 'Voir toutes les annonces' link", async () => {
    mockGetListings.mockResolvedValue({
      items: [baseListing],
      total: 1,
      skip: 0,
      top: 8,
      hasMore: false,
    });
    mockGetCardConfig.mockResolvedValue(defaultConfig);

    const el = await FeaturedListings();
    render(el);

    const viewAll = screen.getByTestId("featured-view-all");
    expect(viewAll).toBeInTheDocument();
    expect(viewAll).toHaveAttribute("href", "/search");
  });

  it("should show empty state when no listings", async () => {
    mockGetListings.mockResolvedValue({
      items: [],
      total: 0,
      skip: 0,
      top: 8,
      hasMore: false,
    });
    mockGetCardConfig.mockResolvedValue(defaultConfig);

    const el = await FeaturedListings();
    render(el);

    expect(screen.getByTestId("featured-empty")).toBeInTheDocument();
    expect(screen.getByText("Aucune annonce pour le moment")).toBeInTheDocument();
    expect(screen.queryByTestId("featured-listings-grid")).not.toBeInTheDocument();
  });

  it("should handle API error gracefully", async () => {
    mockGetListings.mockRejectedValue(new Error("Network error"));
    mockGetCardConfig.mockRejectedValue(new Error("Network error"));

    const el = await FeaturedListings();
    render(el);

    expect(screen.getByTestId("featured-empty")).toBeInTheDocument();
  });

  it("should call getListings with correct params", async () => {
    mockGetListings.mockResolvedValue({ items: [], total: 0, skip: 0, top: 8, hasMore: false });
    mockGetCardConfig.mockResolvedValue([]);

    await FeaturedListings();

    expect(mockGetListings).toHaveBeenCalledWith({
      top: 8,
      filters: { sort: "createdAt_desc" },
    });
  });
});

describe("FeaturedListingsSkeleton", () => {
  it("should render skeleton grid", () => {
    render(<FeaturedListingsSkeleton />);

    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
