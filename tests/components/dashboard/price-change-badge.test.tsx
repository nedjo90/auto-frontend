import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceChangeBadge } from "@/components/dashboard/price-change-badge";
import type { IListingPriceHistory } from "@auto/shared";

vi.mock("@/lib/api/catalog-api", () => ({
  formatPrice: (price: number | null) => (price != null ? `${price} €` : null),
}));

describe("PriceChangeBadge", () => {
  it("should render nothing when no price history", () => {
    const { container } = render(<PriceChangeBadge priceHistory={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("should render nothing when no previous price", () => {
    const history: IListingPriceHistory[] = [
      {
        ID: "ph-1",
        listingId: "l-1",
        price: 15000,
        previousPrice: null,
        changedAt: "2026-01-15T00:00:00Z",
      },
    ];
    const { container } = render(<PriceChangeBadge priceHistory={history} />);
    expect(container.innerHTML).toBe("");
  });

  it("should show price decrease in green", () => {
    const history: IListingPriceHistory[] = [
      {
        ID: "ph-1",
        listingId: "l-1",
        price: 14000,
        previousPrice: 16000,
        changedAt: "2026-01-15T00:00:00Z",
      },
    ];
    render(<PriceChangeBadge priceHistory={history} />);

    const badge = screen.getByTestId("price-change-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("16000");
    expect(badge).toHaveTextContent("14000");
    expect(badge).toHaveClass("bg-green-100");
  });

  it("should show price increase in red", () => {
    const history: IListingPriceHistory[] = [
      {
        ID: "ph-1",
        listingId: "l-1",
        price: 18000,
        previousPrice: 15000,
        changedAt: "2026-01-15T00:00:00Z",
      },
    ];
    render(<PriceChangeBadge priceHistory={history} />);

    const badge = screen.getByTestId("price-change-badge");
    expect(badge).toHaveClass("bg-red-100");
  });

  it("should show percentage diff", () => {
    const history: IListingPriceHistory[] = [
      {
        ID: "ph-1",
        listingId: "l-1",
        price: 9000,
        previousPrice: 10000,
        changedAt: "2026-01-15T00:00:00Z",
      },
    ];
    render(<PriceChangeBadge priceHistory={history} />);

    expect(screen.getByTestId("price-change-badge")).toHaveTextContent("-10%");
  });

  it("should use the most recent price change", () => {
    const history: IListingPriceHistory[] = [
      {
        ID: "ph-2",
        listingId: "l-1",
        price: 12000,
        previousPrice: 14000,
        changedAt: "2026-01-20T00:00:00Z",
      },
      {
        ID: "ph-1",
        listingId: "l-1",
        price: 14000,
        previousPrice: 16000,
        changedAt: "2026-01-10T00:00:00Z",
      },
    ];
    render(<PriceChangeBadge priceHistory={history} />);

    const badge = screen.getByTestId("price-change-badge");
    expect(badge).toHaveTextContent("14000");
    expect(badge).toHaveTextContent("12000");
  });
});
