import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MarketWatchPage from "@/app/(dashboard)/seller/market/page";
import type { IMarketWatchEnriched } from "@auto/shared";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/api/catalog-api", () => ({
  formatPrice: (price: number | null) => (price != null ? `${price} €` : null),
  formatMileage: (mileage: number | null) => (mileage != null ? `${mileage} km` : null),
  buildImageUrl: (url: string | null) => url || "",
}));

const mockGetMarketWatchList = vi.fn();
const mockRemoveFromMarketWatch = vi.fn();
vi.mock("@/lib/api/market-watch-api", () => ({
  getMarketWatchList: (...args: unknown[]) => mockGetMarketWatchList(...args),
  removeFromMarketWatch: (...args: unknown[]) => mockRemoveFromMarketWatch(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockWatch: IMarketWatchEnriched = {
  ID: "watch-1",
  sellerId: "user-1",
  listingId: "listing-1",
  addedAt: "2026-01-10T00:00:00Z",
  notes: "Mon concurrent",
  listing: {
    ID: "listing-1",
    slug: "renault-clio-2022-abc12345",
    make: "Renault",
    model: "Clio",
    variant: null,
    year: 2022,
    price: 14000,
    mileage: 50000,
    fuelType: "Essence",
    gearbox: "Manuelle",
    bodyType: "Berline",
    color: "Rouge",
    condition: "Bon",
    visibilityScore: 75,
    visibilityLabel: "Bien documenté",
    publishedAt: "2026-01-01T00:00:00Z",
    primaryPhotoUrl: "https://cdn/photo.jpg",
    photoCount: 2,
    certifiedFieldCount: 3,
    totalFieldCount: 8,
    sellerId: "other-seller",
    certificationLevel: null,
    ctValid: null,
    marketComparison: null,
  },
  priceHistory: [],
  hasChangedSinceLastVisit: false,
};

describe("MarketWatchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading spinner initially", () => {
    mockGetMarketWatchList.mockReturnValue(new Promise(() => {})); // never resolves
    render(<MarketWatchPage />);
    expect(screen.getByTestId("market-watch-loading")).toBeInTheDocument();
  });

  it("should show empty state when no watches", async () => {
    mockGetMarketWatchList.mockResolvedValue({ items: [], total: 0 });

    render(<MarketWatchPage />);

    await waitFor(() => {
      expect(screen.getByTestId("market-watch-empty")).toBeInTheDocument();
    });
    expect(screen.getByText("Aucune annonce suivie")).toBeInTheDocument();
    expect(screen.getByText("Parcourir les annonces")).toBeInTheDocument();
  });

  it("should display watches in grid", async () => {
    mockGetMarketWatchList.mockResolvedValue({ items: [mockWatch], total: 1 });

    render(<MarketWatchPage />);

    await waitFor(() => {
      expect(screen.getByTestId("market-watch-page")).toBeInTheDocument();
    });
    expect(screen.getByTestId("market-watch-count")).toHaveTextContent("1 annonce suivie");
    expect(screen.getByTestId("market-watch-card-listing-1")).toBeInTheDocument();
  });

  it("should use plural when multiple watches", async () => {
    const watch2 = {
      ...mockWatch,
      ID: "watch-2",
      listingId: "listing-2",
      listing: { ...mockWatch.listing, ID: "listing-2" },
    };
    mockGetMarketWatchList.mockResolvedValue({ items: [mockWatch, watch2], total: 2 });

    render(<MarketWatchPage />);

    await waitFor(() => {
      expect(screen.getByTestId("market-watch-count")).toHaveTextContent("2 annonces suivies");
    });
  });

  it("should remove watch on remove button click", async () => {
    mockGetMarketWatchList.mockResolvedValue({ items: [mockWatch], total: 1 });
    mockRemoveFromMarketWatch.mockResolvedValue({ success: true });

    render(<MarketWatchPage />);

    await waitFor(() => {
      expect(screen.getByTestId("market-watch-card-listing-1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("remove-watch-button"));

    await waitFor(() => {
      expect(mockRemoveFromMarketWatch).toHaveBeenCalledWith("listing-1");
    });

    await waitFor(() => {
      expect(screen.queryByTestId("market-watch-card-listing-1")).not.toBeInTheDocument();
    });
  });

  it("should show changes indicator when watches have changes", async () => {
    const changedWatch = { ...mockWatch, hasChangedSinceLastVisit: true };
    mockGetMarketWatchList.mockResolvedValue({ items: [changedWatch], total: 1 });

    render(<MarketWatchPage />);

    await waitFor(() => {
      expect(screen.getByTestId("changes-indicator")).toBeInTheDocument();
    });
  });

  it("should not show changes indicator when no changes", async () => {
    mockGetMarketWatchList.mockResolvedValue({ items: [mockWatch], total: 1 });

    render(<MarketWatchPage />);

    await waitFor(() => {
      expect(screen.getByTestId("market-watch-page")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("changes-indicator")).not.toBeInTheDocument();
  });
});
