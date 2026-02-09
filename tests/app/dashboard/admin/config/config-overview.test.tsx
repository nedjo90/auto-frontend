import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ConfigOverviewPage from "@/app/(dashboard)/admin/config/page";

describe("ConfigOverviewPage", () => {
  it("should render all config section cards", () => {
    render(<ConfigOverviewPage />);
    expect(screen.getByText("Tarification")).toBeInTheDocument();
    expect(screen.getByText("Textes")).toBeInTheDocument();
    expect(screen.getByText("Fonctionnalites")).toBeInTheDocument();
    expect(screen.getByText("Inscription")).toBeInTheDocument();
    expect(screen.getByText("Affichage carte")).toBeInTheDocument();
  });

  it("should render descriptions for each section", () => {
    render(<ConfigOverviewPage />);
    expect(screen.getByText(/Prix des annonces/)).toBeInTheDocument();
    expect(screen.getByText(/Textes d'interface/)).toBeInTheDocument();
    expect(screen.getByText(/Activer ou desactiver/)).toBeInTheDocument();
  });

  it("should render section cards as links", () => {
    render(<ConfigOverviewPage />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(5);
    expect(links[0]).toHaveAttribute("href", "/admin/config/pricing");
  });
});
