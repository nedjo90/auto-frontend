import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarketPositionDetail } from "@/components/seller/market-position-detail";
import type { ISellerListingPerformance } from "@auto/shared";

function makeListing(
  overrides: Partial<ISellerListingPerformance> = {},
): ISellerListingPerformance {
  return {
    ID: "listing-1",
    make: "Renault",
    model: "Clio",
    year: 2022,
    price: 15000,
    status: "published",
    visibilityScore: 80,
    visibilityLabel: "Très documenté",
    publishedAt: "2026-02-01T08:00:00Z",
    viewCount: 150,
    favoriteCount: 12,
    chatCount: 5,
    daysOnMarket: 23,
    photoCount: 5,
    primaryPhotoUrl: null,
    marketPosition: "aligned",
    marketPercentageDiff: 2,
    marketDisplayText: "Prix aligné",
    marketIsEstimation: true,
    ...overrides,
  };
}

describe("MarketPositionDetail", () => {
  it("renders with aligned position", () => {
    render(<MarketPositionDetail listing={makeListing()} onClose={vi.fn()} />);
    expect(screen.getByTestId("market-position-detail")).toBeInTheDocument();
    expect(screen.getByText("Prix aligné")).toBeInTheDocument();
    expect(screen.getByText("+2%")).toBeInTheDocument();
    expect(screen.getByTestId("market-suggestion")).toBeInTheDocument();
  });

  it("renders with below position", () => {
    render(
      <MarketPositionDetail
        listing={makeListing({
          marketPosition: "below",
          marketPercentageDiff: -8,
          marketDisplayText: "8% en dessous du marché",
        })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("8% en dessous du marché")).toBeInTheDocument();
    expect(screen.getByText("-8%")).toBeInTheDocument();
    expect(screen.getByText(/compétitif/)).toBeInTheDocument();
  });

  it("renders with above position", () => {
    render(
      <MarketPositionDetail
        listing={makeListing({
          marketPosition: "above",
          marketPercentageDiff: 12,
          marketDisplayText: "12% au-dessus du marché",
        })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("12% au-dessus du marché")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(screen.getByText(/baisser le prix/)).toBeInTheDocument();
  });

  it("shows estimation note when isEstimation is true", () => {
    render(<MarketPositionDetail listing={makeListing()} onClose={vi.fn()} />);
    expect(screen.getByTestId("market-estimation-note")).toBeInTheDocument();
    expect(screen.getByText(/données internes/)).toBeInTheDocument();
  });

  it("hides estimation note when isEstimation is false", () => {
    render(
      <MarketPositionDetail
        listing={makeListing({ marketIsEstimation: false })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("market-estimation-note")).not.toBeInTheDocument();
  });

  it("shows unavailable state when marketPosition is unavailable", () => {
    render(
      <MarketPositionDetail
        listing={makeListing({
          marketPosition: "unavailable",
          marketPercentageDiff: null,
          marketDisplayText: null,
        })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/non disponible/)).toBeInTheDocument();
  });

  it("shows unavailable state when marketPosition is null", () => {
    render(
      <MarketPositionDetail
        listing={makeListing({
          marketPosition: null,
          marketPercentageDiff: null,
          marketDisplayText: null,
        })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/non disponible/)).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MarketPositionDetail listing={makeListing()} onClose={onClose} />);
    await user.click(screen.getByTestId("market-detail-close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("displays listing title in header", () => {
    render(<MarketPositionDetail listing={makeListing()} onClose={vi.fn()} />);
    expect(screen.getByText(/Renault Clio 2022/)).toBeInTheDocument();
  });

  it("displays listing price", () => {
    render(<MarketPositionDetail listing={makeListing()} onClose={vi.fn()} />);
    expect(screen.getByText(/15[\s\u202f]000\s*€/)).toBeInTheDocument();
  });
});
