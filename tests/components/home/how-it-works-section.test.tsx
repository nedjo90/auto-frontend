import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HowItWorksSection } from "@/components/home/how-it-works-section";

describe("HowItWorksSection", () => {
  it("should render section with title", () => {
    render(<HowItWorksSection />);

    expect(screen.getByTestId("how-it-works")).toBeInTheDocument();
    expect(screen.getByText("Comment ça marche")).toBeInTheDocument();
  });

  it("should display all 3 steps", () => {
    render(<HowItWorksSection />);

    expect(screen.getByTestId("step-search")).toBeInTheDocument();
    expect(screen.getByTestId("step-compare")).toBeInTheDocument();
    expect(screen.getByTestId("step-contact")).toBeInTheDocument();
  });

  it("should display step titles", () => {
    render(<HowItWorksSection />);

    expect(screen.getByText("Recherchez")).toBeInTheDocument();
    expect(screen.getByText("Comparez")).toBeInTheDocument();
    expect(screen.getByText("Contactez")).toBeInTheDocument();
  });

  it("should display step descriptions", () => {
    render(<HowItWorksSection />);

    expect(
      screen.getByText("Parcourez des annonces vérifiées avec des données certifiées"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Consultez les données certifiées et le rapport d.historique/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Échangez directement avec le vendeur par messagerie"),
    ).toBeInTheDocument();
  });

  it("should display step numbers", () => {
    render(<HowItWorksSection />);

    expect(screen.getByText(/Étape.*1/)).toBeInTheDocument();
    expect(screen.getByText(/Étape.*2/)).toBeInTheDocument();
    expect(screen.getByText(/Étape.*3/)).toBeInTheDocument();
  });

  it("should have responsive grid layout", () => {
    render(<HowItWorksSection />);

    const grid = screen.getByTestId("step-search").parentElement;
    expect(grid?.className).toContain("sm:grid-cols-3");
  });
});
