import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChangeIndicator } from "@/components/favorites/change-indicator";
import type { IFavoriteChanges } from "@auto/shared";

// Mock catalog-api
vi.mock("@/lib/api/catalog-api", () => ({
  formatPrice: (price: number | null) => (price != null ? `${price} €` : null),
}));

const noChanges: IFavoriteChanges = {
  priceChanged: false,
  oldPrice: null,
  newPrice: null,
  certificationChanged: false,
  oldCertificationLevel: null,
  newCertificationLevel: null,
  photosAdded: 0,
};

describe("ChangeIndicator", () => {
  it("should render nothing when no changes", () => {
    const { container } = render(<ChangeIndicator changes={noChanges} />);
    expect(container.innerHTML).toBe("");
  });

  it("should show price decrease badge in green", () => {
    render(
      <ChangeIndicator
        changes={{
          ...noChanges,
          priceChanged: true,
          oldPrice: 15000,
          newPrice: 14000,
        }}
      />,
    );
    expect(screen.getByTestId("change-indicator")).toBeInTheDocument();
    expect(screen.getByTestId("change-price")).toBeInTheDocument();
    expect(screen.getByTestId("change-price")).toHaveTextContent("15000");
    expect(screen.getByTestId("change-price")).toHaveTextContent("14000");
    expect(screen.getByTestId("change-price")).toHaveClass("bg-green-100");
  });

  it("should show price increase badge in red", () => {
    render(
      <ChangeIndicator
        changes={{
          ...noChanges,
          priceChanged: true,
          oldPrice: 14000,
          newPrice: 16000,
        }}
      />,
    );
    expect(screen.getByTestId("change-price")).toHaveClass("bg-red-100");
  });

  it("should show photos added badge", () => {
    render(
      <ChangeIndicator
        changes={{
          ...noChanges,
          photosAdded: 3,
        }}
      />,
    );
    expect(screen.getByTestId("change-photos")).toHaveTextContent("+3 photos");
  });

  it("should show singular photo text", () => {
    render(
      <ChangeIndicator
        changes={{
          ...noChanges,
          photosAdded: 1,
        }}
      />,
    );
    expect(screen.getByTestId("change-photos")).toHaveTextContent("+1 photo");
  });

  it("should show certification change badge", () => {
    render(
      <ChangeIndicator
        changes={{
          ...noChanges,
          certificationChanged: true,
          oldCertificationLevel: "partiellement_documente",
          newCertificationLevel: "bien_documente",
        }}
      />,
    );
    expect(screen.getByTestId("change-certification")).toHaveTextContent(
      "Certification mise à jour",
    );
  });

  it("should show multiple changes", () => {
    render(
      <ChangeIndicator
        changes={{
          priceChanged: true,
          oldPrice: 15000,
          newPrice: 14000,
          certificationChanged: true,
          oldCertificationLevel: "partiellement_documente",
          newCertificationLevel: "bien_documente",
          photosAdded: 2,
        }}
      />,
    );
    expect(screen.getByTestId("change-price")).toBeInTheDocument();
    expect(screen.getByTestId("change-photos")).toBeInTheDocument();
    expect(screen.getByTestId("change-certification")).toBeInTheDocument();
  });
});
