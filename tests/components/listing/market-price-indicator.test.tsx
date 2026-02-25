import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MarketPriceIndicator } from "@/components/listing/market-price-indicator";
import type { MarketComparison } from "@auto/shared";

describe("MarketPriceIndicator", () => {
  it("renders nothing when comparison is null", () => {
    const { container } = render(<MarketPriceIndicator comparison={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders below market indicator with green text", () => {
    const comparison: MarketComparison = {
      position: "below",
      percentageDiff: -8,
      displayText: "8% en dessous du marché",
    };
    render(<MarketPriceIndicator comparison={comparison} />);
    const el = screen.getByTestId("market-indicator-below");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("8% en dessous du marché");
    expect(el).toHaveStyle({ color: "var(--market-below)" });
  });

  it("renders aligned indicator with gray text", () => {
    const comparison: MarketComparison = {
      position: "aligned",
      percentageDiff: 0,
      displayText: "Prix aligné",
    };
    render(<MarketPriceIndicator comparison={comparison} />);
    const el = screen.getByTestId("market-indicator-aligned");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Prix aligné");
    expect(el).toHaveStyle({ color: "var(--market-aligned)" });
  });

  it("renders above market indicator with orange text", () => {
    const comparison: MarketComparison = {
      position: "above",
      percentageDiff: 15,
      displayText: "15% au-dessus du marché",
    };
    render(<MarketPriceIndicator comparison={comparison} />);
    const el = screen.getByTestId("market-indicator-above");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("15% au-dessus du marché");
    expect(el).toHaveStyle({ color: "var(--market-above)" });
  });

  it("renders unavailable indicator with muted text", () => {
    const comparison: MarketComparison = {
      position: "unavailable",
      percentageDiff: null,
      displayText: "Estimation non disponible",
    };
    render(<MarketPriceIndicator comparison={comparison} />);
    const el = screen.getByTestId("market-indicator-unavailable");
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("Estimation non disponible");
  });

  it("uses compact size when compact prop is true", () => {
    const comparison: MarketComparison = {
      position: "below",
      percentageDiff: -10,
      displayText: "10% en dessous du marché",
    };
    render(<MarketPriceIndicator comparison={comparison} compact />);
    const el = screen.getByTestId("market-indicator-below");
    expect(el.className).toContain("text-xs");
  });

  it("uses normal size when compact prop is false", () => {
    const comparison: MarketComparison = {
      position: "below",
      percentageDiff: -10,
      displayText: "10% en dessous du marché",
    };
    render(<MarketPriceIndicator comparison={comparison} />);
    const el = screen.getByTestId("market-indicator-below");
    expect(el.className).toContain("text-sm");
  });
});
