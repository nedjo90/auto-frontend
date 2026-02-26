import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarketWatchCard } from "@/components/dashboard/market-watch-card";
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

const baseWatch: IMarketWatchEnriched = {
  ID: "watch-1",
  sellerId: "user-1",
  listingId: "listing-1",
  addedAt: "2026-01-10T00:00:00Z",
  notes: null,
  listing: {
    ID: "listing-1",
    slug: "peugeot-308-2023-abc12345",
    make: "Peugeot",
    model: "308",
    variant: "GT",
    year: 2023,
    price: 25000,
    mileage: 30000,
    fuelType: "Diesel",
    gearbox: "Automatique",
    bodyType: "Berline",
    color: "Noir",
    condition: "Excellent",
    visibilityScore: 85,
    visibilityLabel: "Bien documenté",
    publishedAt: "2026-01-01T00:00:00Z",
    primaryPhotoUrl: "https://cdn/photo1.jpg",
    photoCount: 3,
    certifiedFieldCount: 5,
    totalFieldCount: 10,
    sellerId: "other-seller",
    certificationLevel: "bien_documente",
    ctValid: true,
    marketComparison: null,
  },
  priceHistory: [],
  hasChangedSinceLastVisit: false,
};

describe("MarketWatchCard", () => {
  it("should render listing title and price", () => {
    render(<MarketWatchCard watch={baseWatch} onRemove={vi.fn()} />);

    expect(screen.getByTestId("watch-title")).toHaveTextContent("Peugeot 308 (2023)");
    expect(screen.getByTestId("watch-price")).toHaveTextContent("25000");
  });

  it("should show change badge when hasChangedSinceLastVisit", () => {
    const watch = { ...baseWatch, hasChangedSinceLastVisit: true };
    render(<MarketWatchCard watch={watch} onRemove={vi.fn()} />);

    expect(screen.getByTestId("change-badge")).toHaveTextContent("Modifié");
  });

  it("should not show change badge when no changes", () => {
    render(<MarketWatchCard watch={baseWatch} onRemove={vi.fn()} />);

    expect(screen.queryByTestId("change-badge")).not.toBeInTheDocument();
  });

  it("should show notes when provided", () => {
    const watch = { ...baseWatch, notes: "Concurrent direct sur le 308" };
    render(<MarketWatchCard watch={watch} onRemove={vi.fn()} />);

    expect(screen.getByTestId("watch-notes")).toHaveTextContent("Concurrent direct sur le 308");
  });

  it("should not show notes section when null", () => {
    render(<MarketWatchCard watch={baseWatch} onRemove={vi.fn()} />);
    expect(screen.queryByTestId("watch-notes")).not.toBeInTheDocument();
  });

  it("should show price history when available", () => {
    const watch: IMarketWatchEnriched = {
      ...baseWatch,
      priceHistory: [
        {
          ID: "ph-1",
          listingId: "listing-1",
          price: 25000,
          previousPrice: 27000,
          changedAt: "2026-01-15T00:00:00Z",
        },
      ],
    };
    render(<MarketWatchCard watch={watch} onRemove={vi.fn()} />);

    expect(screen.getByTestId("price-history")).toBeInTheDocument();
    expect(screen.getByTestId("price-change-badge")).toBeInTheDocument();
  });

  it("should call onRemove when remove button is clicked", () => {
    const onRemove = vi.fn();
    render(<MarketWatchCard watch={baseWatch} onRemove={onRemove} />);

    fireEvent.click(screen.getByTestId("remove-watch-button"));
    expect(onRemove).toHaveBeenCalledWith("listing-1");
  });

  it("should stop propagation on remove button click", () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <MarketWatchCard watch={baseWatch} onRemove={vi.fn()} />
      </div>,
    );

    fireEvent.click(screen.getByTestId("remove-watch-button"));
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("should have accessible remove button", () => {
    render(<MarketWatchCard watch={baseWatch} onRemove={vi.fn()} />);
    expect(screen.getByTestId("remove-watch-button")).toHaveAttribute(
      "aria-label",
      "Retirer du suivi",
    );
  });

  it("should display days online", () => {
    render(<MarketWatchCard watch={baseWatch} onRemove={vi.fn()} />);
    // publishedAt is 2026-01-01, so days should be > 0
    expect(screen.getByText(/j en ligne/)).toBeInTheDocument();
  });

  it("should show mileage badge", () => {
    render(<MarketWatchCard watch={baseWatch} onRemove={vi.fn()} />);
    expect(screen.getByText("30000 km")).toBeInTheDocument();
  });

  it("should show certification badge", () => {
    render(<MarketWatchCard watch={baseWatch} onRemove={vi.fn()} />);
    expect(screen.getByText("bien_documente")).toBeInTheDocument();
  });
});
