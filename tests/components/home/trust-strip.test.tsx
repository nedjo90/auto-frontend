import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrustStrip } from "@/components/home/trust-strip";

describe("TrustStrip", () => {
  it("should render trust strip section", () => {
    render(<TrustStrip />);
    expect(screen.getByTestId("trust-strip")).toBeInTheDocument();
  });

  it("should display all 4 trust indicators", () => {
    render(<TrustStrip />);

    expect(screen.getByTestId("trust-certified")).toBeInTheDocument();
    expect(screen.getByTestId("trust-history")).toBeInTheDocument();
    expect(screen.getByTestId("trust-payment")).toBeInTheDocument();
    expect(screen.getByTestId("trust-market")).toBeInTheDocument();
  });

  it("should display trust indicator labels", () => {
    render(<TrustStrip />);

    expect(screen.getByText("Donnees certifiees")).toBeInTheDocument();
    expect(screen.getByText("Historique verifie")).toBeInTheDocument();
    expect(screen.getByText("Paiement securise")).toBeInTheDocument();
    expect(screen.getByText("Prix du marche")).toBeInTheDocument();
  });

  it("should have responsive grid layout", () => {
    render(<TrustStrip />);

    const grid = screen.getByTestId("trust-strip").firstElementChild;
    expect(grid?.className).toContain("grid-cols-2");
    expect(grid?.className).toContain("sm:grid-cols-4");
  });
});
